import { supabase } from '@/api/supabase';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export function useTransactions(userId: string) {
    return useQuery({
        queryKey: ['transactions', userId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('transactions')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data;
        },
        enabled: !!userId
    });
}

export function useDeposit() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ userId, amount, reference }: { userId: string, amount: number, reference: string }) => {
            // 1. Create transaction record
            const { error: txError } = await supabase
                .from('transactions')
                .insert({
                    user_id: userId,
                    amount,
                    type: 'deposit',
                    status: 'completed',
                    reference
                });

            if (txError) throw txError;

            // 2. Update user balance
            const { data: profile } = await supabase
                .from('profiles')
                .select('balance')
                .eq('id', userId)
                .single();

            const newBalance = (Number(profile?.balance) || 0) + amount;

            const { error: profileError } = await supabase
                .from('profiles')
                .update({ balance: newBalance })
                .eq('id', userId);

            if (profileError) throw profileError;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['transactions'] });
            queryClient.invalidateQueries({ queryKey: ['profile'] });
        }
    });
}

export function useSubscribe() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ userId, amount, planName }: { userId: string, amount: number, planName: string }) => {
            // 1. Check balance
            const { data: profile } = await supabase
                .from('profiles')
                .select('balance')
                .eq('id', userId)
                .single();

            const currentBalance = Number(profile?.balance) || 0;
            if (currentBalance < amount) throw new Error("Balance ku filan ma haysatid.");

            // 2. Create transaction record
            const { error: txError } = await supabase
                .from('transactions')
                .insert({
                    user_id: userId,
                    amount,
                    type: 'subscription',
                    status: 'completed',
                    reference: planName
                });

            if (txError) throw txError;

            // 3. Update balance and premium status
            const { error: profileError } = await supabase
                .from('profiles')
                .update({
                    balance: currentBalance - amount,
                    is_premium: true
                })
                .eq('id', userId);

            if (profileError) throw profileError;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['transactions'] });
            queryClient.invalidateQueries({ queryKey: ['profile'] });
        }
    });
}
