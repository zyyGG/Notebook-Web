import { defineStore } from "pinia";

type GameState = {
  title: string;
}

export const useGameStore = defineStore<"game", GameState>("game", {
  state: () => ({
    title: ""
  })
})

