module.exports = () => {
    return {
        name: "esbuild:html",
        setup(build) {
            build.onResolve({ filter: /^env$/ }, (args) => ({
                path: args.path,
                namespace: "env-ns",
            }));
            build.onLoad({ filter: /.*/, namespace: "env-ns" }, () => {
                const a = JSON.stringify(process.env);

                return {
                    contents: JSON.stringify(process.env),
                    loader: "json",
                };
            });
        },
    };
};
