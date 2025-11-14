module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    // Opcional: ative o plugin do Worklets/Reanimated v4 se necessário.
    plugins: ['react-native-worklets/plugin'],
  };
};
