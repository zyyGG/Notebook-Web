<template>
  <div class="home-shell">
    <header class="topbar">
      <router-link to="/" class="brand">
        <span class="brand-mark">S</span>
        <span>技能学习机</span>
      </router-link>
      <nav class="navigation" aria-label="主导航">
        <TabBarButton :activeClassName="route.path === '/' ? 'text-blue' : ''">
          <router-link to="/">首页</router-link>
        </TabBarButton>
        <TabBarButton :activeClassName="route.path === '/diary' ? 'text-blue' : ''">
          <router-link to="/diary">日志</router-link>
        </TabBarButton>
        <TabBarButton :activeClassName="route.path === '/gameSelector' ? 'text-blue' : ''">
          <router-link to="/gameSelector">游戏 Demo</router-link>
        </TabBarButton>
        <TabBarButton :activeClassName="route.path === '/threejs' ? 'text-blue' : ''">
          <router-link to="/threejs">Three.js</router-link>
        </TabBarButton>
      </nav>
    </header>

    <main v-if="route.path === '/'" class="landing-page">
      <section class="hero">
        <div class="hero-copy">
          <UiBadge dot>一个持续生长的创作空间</UiBadge>
          <h1>把想法，<br /><span>做成可玩的东西。</span></h1>
          <p class="hero-description">
            从经典小游戏到 Three.js 场景实验，这里记录每一次动手、尝试和进步。
            选一个感兴趣的方向，现在就开始探索。
          </p>
          <div class="hero-actions">
            <UiButton to="/gameSelector">
              发现小游戏 <span aria-hidden="true">→</span>
            </UiButton>
            <UiButton to="/threejs" variant="secondary">浏览 Three.js 实验</UiButton>
          </div>
          <div class="hero-note">
            <span class="note-line"></span>
            <span>边玩边学，让每个小项目都成为一次新发现</span>
          </div>
        </div>

        <div class="hero-art" aria-hidden="true">
          <div class="art-orbit orbit-outer"></div>
          <div class="art-orbit orbit-inner"></div>
          <div class="art-spark spark-one">✦</div>
          <div class="art-spark spark-two">✳</div>
          <div class="art-card art-card-back">
            <span class="art-card-label">CREATIVE CODE</span>
            <span class="art-card-symbol">{ }</span>
            <span class="art-card-caption">想象力正在运行</span>
          </div>
          <div class="art-card art-card-front">
            <span class="art-card-label">LEVEL 01 · START</span>
            <div class="pixel-board">
              <span v-for="cell in 16" :key="cell" :class="{ 'pixel-on': [2, 5, 6, 7, 9, 10, 14].includes(cell) }"></span>
            </div>
            <span class="art-card-caption">今天也来创造一点</span>
          </div>
          <div class="art-orb"></div>
        </div>
      </section>

      <section class="explore-section">
        <UiSectionHeading eyebrow="从这里开始" title="挑一个方向，开始探索">
          <template #action>
            <router-link to="/gameSelector" class="text-link">全部内容 <span aria-hidden="true">↗</span></router-link>
          </template>
        </UiSectionHeading>

        <div class="explore-grid">
          <UiCard to="/gameSelector" class="explore-card">
            <span class="card-index">01 / PLAY</span>
            <span class="card-icon game-icon" aria-hidden="true">✹</span>
            <span class="card-title">小游戏</span>
            <span class="card-description">扫雷、连连看、俄罗斯方块等 4 款小游戏，点开就能玩。</span>
            <span class="card-link">进入游戏列表 <span aria-hidden="true">→</span></span>
          </UiCard>
          <UiCard to="/threejs" class="explore-card">
            <span class="card-index">02 / EXPERIMENT</span>
            <span class="card-icon three-icon" aria-hidden="true">◈</span>
            <span class="card-title">Three.js 实验室</span>
            <span class="card-description">浏览 3D 场景与交互实验，看看代码如何变成画面。</span>
            <span class="card-link">进入实验室 <span aria-hidden="true">→</span></span>
          </UiCard>
          <UiCard to="/diary" class="explore-card">
            <span class="card-index">03 / NOTES</span>
            <span class="card-icon diary-icon" aria-hidden="true">✎</span>
            <span class="card-title">创作日志</span>
            <span class="card-description">记录项目进度、灵感和开发过程中的小发现。</span>
            <span class="card-link">阅读日志 <span aria-hidden="true">→</span></span>
          </UiCard>
        </div>
      </section>

      <footer class="landing-footer">
        <span>技能学习机 <span class="footer-divider">/</span> 用代码做点有趣的事</span>
        <span>持续创作中 <span class="footer-dot"></span></span>
      </footer>
    </main>

    <div v-else class="page-content">
      <router-view />
    </div>
  </div>
</template>
<script lang="ts" setup>
import TabBarButton from "../components/TabBarButton.vue"
import { UiBadge, UiButton, UiCard, UiSectionHeading } from "../components/ui"
import { useRoute } from "vue-router";

const route = useRoute();
</script>
<style scoped>
.home-shell {
  min-height: 100vh;
  color: var(--ui-color-text);
  background: var(--ui-color-background);
}

.topbar {
  position: sticky;
  z-index: 2;
  top: 0;
  display: flex;
  height: 64px;
  align-items: center;
  justify-content: space-between;
  padding: 0 7.2%;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(23, 25, 29, 0.94);
  backdrop-filter: blur(16px);
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--ui-color-text);
  font-size: 15px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-decoration: none;
}

.brand-mark {
  display: grid;
  width: 30px;
  height: 30px;
  place-items: center;
  border-radius: 9px;
  color: var(--ui-color-background);
  background: var(--ui-color-accent);
  font-size: 16px;
  font-weight: 900;
}

.navigation {
  display: flex;
  height: 100%;
}

.navigation :deep(a) {
  color: inherit;
  text-decoration: none;
}

.landing-page {
  width: min(1120px, 85.6%);
  margin: 0 auto;
}

.hero {
  position: relative;
  display: grid;
  min-height: 515px;
  grid-template-columns: 1.08fr 0.92fr;
  align-items: center;
  gap: 36px;
  padding: 56px 0 48px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.hero-copy {
  position: relative;
  z-index: 1;
}

.hero h1 {
  margin: 23px 0 18px;
  color: var(--ui-color-text);
  font-size: clamp(42px, 5vw, 66px);
  font-weight: 800;
  letter-spacing: -0.065em;
  line-height: 1.12;
}

.hero h1 span {
  color: var(--ui-color-accent);
}

.hero-description {
  max-width: 470px;
  margin: 0;
  color: #a4a6a7;
  font-size: 14px;
  line-height: 1.9;
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 30px;
}

.hero-note {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 37px;
  color: #777b7e;
  font-size: 11px;
}

.note-line {
  width: 22px;
  height: 1px;
  background: #777b7e;
}

.hero-art {
  position: relative;
  display: grid;
  min-height: 360px;
  place-items: center;
  overflow: hidden;
}

.art-orbit {
  position: absolute;
  border: 1px solid rgba(182, 239, 103, 0.13);
  border-radius: 50%;
  transform: rotate(-24deg);
}

.orbit-outer {
  width: 330px;
  height: 190px;
}

.orbit-inner {
  width: 250px;
  height: 135px;
  border-color: rgba(255, 255, 255, 0.09);
  transform: rotate(38deg);
}

.art-card {
  position: absolute;
  display: flex;
  width: 222px;
  height: 258px;
  flex-direction: column;
  justify-content: space-between;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.13);
  border-radius: 14px;
  background: var(--ui-color-surface-raised);
  box-shadow: 0 24px 70px rgba(0, 0, 0, 0.36);
}

.art-card-back {
  z-index: 0;
  margin: -38px 0 0 116px;
  transform: rotate(10deg);
}

.art-card-front {
  z-index: 1;
  margin: 28px 80px 0 0;
  background: linear-gradient(145deg, #30342f, #212429 74%);
  transform: rotate(-7deg);
}

.art-card-label {
  color: #a2a5a1;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.14em;
}

.art-card-symbol {
  color: var(--ui-color-accent);
  font-family: monospace;
  font-size: 68px;
  font-weight: 700;
  text-align: center;
}

.art-card-caption {
  color: #c3c4bf;
  font-size: 10px;
}

.pixel-board {
  display: grid;
  width: 142px;
  height: 142px;
  align-self: center;
  grid-template-columns: repeat(4, 1fr);
  gap: 6px;
  padding: 10px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  background: rgba(13, 15, 17, 0.55);
}

.pixel-board span {
  border-radius: 4px;
  background: #33383a;
}

.pixel-board .pixel-on {
  background: var(--ui-color-accent);
  box-shadow: 0 0 12px rgba(182, 239, 103, 0.28);
}

.art-spark {
  position: absolute;
  z-index: 1;
  color: var(--ui-color-accent);
}

.spark-one {
  top: 56px;
  right: 48px;
  font-size: 25px;
}

.spark-two {
  bottom: 43px;
  left: 47px;
  color: #e8a77c;
  font-size: 21px;
}

.art-orb {
  position: absolute;
  top: 50px;
  right: 63px;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #e8a77c;
  box-shadow: 0 0 20px rgba(232, 167, 124, 0.55);
}

.explore-section {
  padding: 42px 0 55px;
}

.text-link {
  padding-bottom: 3px;
  color: #a4a6a7;
  font-size: 11px;
  text-decoration: none;
}

.text-link:hover {
  color: var(--ui-color-accent);
}

.explore-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}

.explore-card {
  display: flex;
  min-height: 220px;
  flex-direction: column;
  align-items: flex-start;
  padding: 19px;
}

.card-index {
  color: var(--ui-color-text-subtle);
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.14em;
}

.card-icon {
  display: grid;
  width: 38px;
  height: 38px;
  place-items: center;
  margin: 19px 0 12px;
  border-radius: 10px;
  font-size: 21px;
}

.game-icon {
  color: var(--ui-color-accent);
  background: rgba(182, 239, 103, 0.12);
}

.three-icon {
  color: var(--ui-color-blue);
  background: rgba(91, 174, 245, 0.13);
}

.diary-icon {
  color: var(--ui-color-warm);
  background: rgba(242, 181, 139, 0.12);
}

.card-title {
  font-size: 15px;
  font-weight: 700;
}

.card-description {
  max-width: 280px;
  margin-top: 8px;
  color: var(--ui-color-text-muted);
  font-size: 11px;
  line-height: 1.7;
}

.card-link {
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  margin-top: auto;
  padding-top: 14px;
  font-size: 10px;
  font-weight: 700;
  color: var(--ui-color-accent);
}

.landing-footer {
  display: flex;
  min-height: 52px;
  align-items: center;
  justify-content: space-between;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  color: #777b7e;
  font-size: 10px;
}

.footer-divider {
  padding: 0 5px;
  color: #44484a;
}

.landing-footer > span:last-child {
  display: flex;
  align-items: center;
  gap: 8px;
}

.footer-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--ui-color-accent);
  box-shadow: 0 0 12px rgba(182, 239, 103, 0.65);
}

.page-content {
  min-height: calc(100vh - 64px);
  padding: 16px 7.2%;
}

@media (max-width: 760px) {
  .topbar {
    height: 58px;
    padding: 0 5%;
  }

  .brand {
    gap: 7px;
    font-size: 12px;
  }

  .brand-mark {
    width: 26px;
    height: 26px;
  }

  .navigation :deep(.flex.items-center.justify-center) {
    width: auto;
    padding: 0 9px;
    font-size: 11px;
  }

  .landing-page {
    width: 90%;
  }

  .hero {
    min-height: auto;
    grid-template-columns: 1fr;
    gap: 0;
    padding: 54px 0 28px;
  }

  .hero h1 {
    font-size: clamp(42px, 10vw, 58px);
  }

  .hero-art {
    min-height: 300px;
  }

  .explore-section {
    padding-top: 32px;
  }

  .explore-grid {
    grid-template-columns: 1fr;
  }

  .explore-card {
    min-height: 195px;
  }

  .page-content {
    padding: 12px 5%;
  }
}

@media (max-width: 420px) {
  .brand > span:last-child {
    display: none;
  }

  .navigation :deep(.flex.items-center.justify-center) {
    padding: 0 7px;
    font-size: 10px;
  }

  .hero-actions {
    align-items: stretch;
    flex-direction: column;
  }
}
</style>