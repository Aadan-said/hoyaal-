module.exports = function (api) {
    api.cache(true);
    return {
        presets: ['babel-preset-expo'],
        plugins: [
            [
                'module-resolver',
                {
                    alias: {
                        'ws': './mocks/ws.js',
                        'stream': './mocks/dummy.js',
                        'http': './mocks/dummy.js',
                        'https': './mocks/dummy.js',
                        'net': './mocks/dummy.js',
                        'tls': './mocks/dummy.js',
                        'dgram': './mocks/dummy.js',
                        'zlib': './mocks/dummy.js',
                        'url': './mocks/dummy.js',
                        'crypto': './mocks/dummy.js',
                        'events': './mocks/dummy.js',
                    },
                },
            ],
        ],
    };
};