export function loadConfig<T>(gamename: string, defaultConfig: T): T {
  return JSON.parse(localStorage.getItem(`gameConfig_${gamename}`) || JSON.stringify(defaultConfig)) as T;
}

export function saveConfig<T>(gamename: string, config: T) {
  localStorage.setItem(`gameConfig_${gamename}`, JSON.stringify(config));
}