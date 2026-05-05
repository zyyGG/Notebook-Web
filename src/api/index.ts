export default function (url: string, options?: RequestInit) {
  return fetch(url, options).then(response => response.json())
}