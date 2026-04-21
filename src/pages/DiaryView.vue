<template>
  <div class="border p-4">
    <!-- <template v-for="(page, index) in fileTreeRoot" :key="index">
      <p>{{ page.title }}</p>
    </template> -->
  </div>
</template>
<script lang="ts" setup>
import { ref, onMounted } from "vue";
type NotebookFile = {
  attributes: {
    description: string,
    tags: string[],
    title: string,
  },
  html: string,
}

type NotebookTreeNode = {
  title: string,
  children?: NotebookTreeNode[],
}

// const pages = ref<NotebookFile[]>([]);
const files = ref<string[]>([]);


onMounted(async () => {
  // console.log(file)
  const notebookFiles: Record<string, () => Promise<{ [key: string] : any}>> = import.meta.glob("../assets/notebook/**/*.md");
  for(let i = 0; i < Object.keys(notebookFiles).length; i++) {
    const filePath = Object.keys(notebookFiles)[i];
    files.value.push(filePath.replace("../assets/notebook/", ""))
  }
  console.log(files.value)
    
  // for(let i = 0; i < Object.keys(notebookFiles).length; i++) {
  //   const filePath = Object.keys(notebookFiles)[i];
  //   // console.log(filePath)
  //   const result: NotebookFile = await notebookFiles[filePath]() as NotebookFile;
  //   if(result){
  //     const clearPath = filePath.split("../assets/notebook/").slice(-1)[0]
  //     // console.log("clearPath:", clearPath)


  //     if(!result.attributes || !result.attributes.title) {
  //       result.attributes.title = filePath.split("../assets/notebook/").slice(-1)[0].replace(".md", "")
  //     }
  //     // pages.value.push(result)
  //   }
  // }
  // const result: NotebookFile = await notebookFiles["../assets/notebook/demo.md"]()
  // console.log(result)
  // if(result){
  //   if(!result.attributes || !result.attributes.title) {
  //     result.attributes.title = "未命名文章"
  //   }
  //   pages.value.push(result)
  // }
  // import.meta.glob 返回的是文件映射，这里从文件路径中提取目录并去重
  const folders = Array.from(
    (() => {
      const set = new Set(
        Object.keys(notebookFiles).map((filePath) => {
          const lastSlashIndex = filePath.lastIndexOf("/");
          return filePath.slice(0, lastSlashIndex);
        })
      )
      set.delete("../assets/notebook") // 删除根目录
      return set
    })()
  );
})
</script>
<style lang="scss" scoped></style>
