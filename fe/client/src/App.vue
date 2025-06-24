<template>
  <div class="wrap">
    <div class="container-input">
      <v-responsive class="mx-auto" max-width="500">
        <a-space direction="vertical" style="width: 100%">
          <a-input-search v-model:value="partNumber" placeholder="Enter part number list" :loading="loading"
            enter-button @search="onHandleSearch" />
        </a-space>
      </v-responsive>
    </div>
    <div class="pn-list-wrap">
      <ul class="list">
        <li v-for="(pn, id) in listPartNumber" :key="id" class="list-item">{{ pn }}</li>
      </ul>
    </div>
    <div class="table-wrap">
      <TablePn :loading-api="loadingDataTable" :data="dataPnList"></TablePn>
    </div>
  </div>
</template>
<script>
import axios from 'axios';
import { defineComponent, onMounted, ref } from 'vue';
import TablePn from './components/tablePn.vue';

export default defineComponent({
  name: "App",
  props: {},
  components: {
    TablePn,
  },
  setup() {
    const loading = ref(false);
    const partNumber = ref("");
    const listPartNumber = ref([]);
    const loadingDataTable = ref(false);
    const dataPnList = ref();

    console.log(import.meta.env.VITE_CLIENT_URL);
    const clientUrl = import.meta.env.VITE_CLIENT_URL;

    const onHandleSearch = (val, event) => {
      if (event instanceof KeyboardEvent) {
        onInputPartNumber(val);
      } else if (event instanceof MouseEvent) {
        onSearchPN();
      }
    }

    const onSearchPN = async () => {
      loading.value = true
      try {
        const res = await axios.post(`${clientUrl}/api/products/import`, {
          partNumbers: listPartNumber.value,
          parallel: true
        })
        if (res && res.status === 200) {
          alert('Ok!')
        }
      } catch (err) {
        alert(err);
      } finally {
        loading.value = false
      }
    }

    const getListPn = async () => {
      loadingDataTable.value = true
      try {
        const res = await axios.get(`${clientUrl}/api/products/list`);
         if (res && res.status === 200) {
          if (res.data && res.data.data && res.data.data.length) {
            dataPnList.value = res.data.data;
          }
        }
      } catch(err) {
        console.log(err)
      } finally {
        loadingDataTable.value= false
      }
    }

    const onInputPartNumber = () => {
      listPartNumber.value.push(partNumber.value)
      partNumber.value = ""
    }

    onMounted(() => {
      getListPn();
    })
    return {
      loading,
      partNumber,
      listPartNumber,
      dataPnList,
      loadingDataTable,
      onHandleSearch,
      onSearchPN,
      onInputPartNumber
    }
  }
})
</script>
<style scoped lang="css">
.wrap {
  margin-top: 40px;
}

.container-input {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.pn-list-wrap {
  display: flex;
  justify-content: center;
  margin-top: 30px;
}

.list {
  display: flex;
  width: 50%;
  flex-wrap: wrap;
}

.list-item {
  margin-left: 10px;
  margin-bottom: 10px;
  list-style: none;
  width: fit-content;
  background-color: bisque;
  border-radius: 4px;
  border: 1px solid #FAFAFA;
  padding: 5px 10px;
  color: #242424
}
.table-wrap {
  padding: 40px;
}
</style>
