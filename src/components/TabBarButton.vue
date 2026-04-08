<template>
  <div class="flex items-center justify-center h-full w-24 cursor-pointer">
    <span class="text-center font-bold text-size-base hover:text-opacity-60 transition duration-300"
    :class="[...props.activeClassName.split(' ')]">
      <slot></slot>
    </span>
  </div>
</template>
<script lang="ts" setup>
const props = defineProps({
  activeClassName: {
    type: String,
    default: ""
  }
})

</script>
<style lang="scss" scoped>

</style>
