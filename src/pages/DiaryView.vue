<template>
  <div class="border p-4">

  </div>
</template>
<script lang="ts" setup>
import { onMounted, ref } from "vue";
import axios from "axios";
import request from "../../api/index"

onMounted(async () => {
  const res = await axios({
    url: "/api/pages/list",
  })
  console.log(res)
  // request({
  //   url: "/api/pages/list",
  // })
  // const res = await request({
  //   url: "/diary",
  // })
  // console.log(res)
})


// import { ref, onMounted } from "vue";
// type NotebookFile = {
//   attributes: {
//     description: string,
//     tags: string[],
//     title: string,
//   },
//   html: string,
// }

// type NotebookTreeNode = {
//   title: string,
//   children?: NotebookTreeNode[],
// }

// // const pages = ref<NotebookFile[]>([]);
// const files = ref<string[]>([]);
// const fileTreeRoot = ref<NotebookTreeNode[]>([]);

// onMounted(async () => {
//   // console.log(file)
//   const notebookFiles: Record<string, () => Promise<{ [key: string] : any}>> = import.meta.glob("../assets/notebook/**/*.md");
//   for(let i = 0; i < Object.keys(notebookFiles).length; i++) {
//     const filePath = Object.keys(notebookFiles)[i];
//     files.value.push(filePath.replace("../assets/notebook/", ""))
//   }
//   // import.meta.glob 返回的是文件映射，这里从文件路径中提取目录并去重
//   const folders = Array.from(
//     (() => {
//       const set = new Set(
//         Object.keys(notebookFiles).map((filePath) => {
//           const lastSlashIndex = filePath.lastIndexOf("/");
//           return filePath.slice(0, lastSlashIndex);
//         })
//       )
//       set.delete("../assets/notebook") // 删除根目录
//       return set
//     })()
//   );
//   console.log(folders)
// })
</script>
<style lang="scss" scoped></style>
