
<template>
<div>
 <div class="common-layout">
   <el-container>
     <el-header>
        <gHeader/>
     </el-header>
     <el-container>
       <el-main style="min-height: 800px;">
        <Center></Center>
       </el-main>
     </el-container>
     <el-footer>
      <gFooter/>
     </el-footer>
   </el-container>
  </div>
</div>
</template>

<script lang="ts" setup>
import gHeader from "./components/header.vue";
import Center from "./components/center.vue";
import gFooter from "./components/footer.vue";


</script>


