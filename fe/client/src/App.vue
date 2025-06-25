<template>
  <a-spin :spinning="loadingPage" size="large" tip="Loading..."  class="fullscreen-spin">
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
        <div class="list-item-wrap">
          <a-tag v-for="(pn, id) in listPartNumber" color="geekblue" closable @close="onDeletePn(id)" :key="id">
            {{ pn }}
          </a-tag>
        </div>
      </div>
      <div class="btn-wrap">
        <a-button type="primary" @click="onExportExel" :disabled="!selectedRowKeys.length">Export Exel</a-button>
      </div>
      <div class="table-wrap">
        <TablePn :loading-api="loadingDataTable" :data="dataPnList" @on-row-select="onRowSelect"
          :selected-rows="selectedRowKeys"></TablePn>
      </div>
    </div>
  </a-spin>
</template>
<script>
import axios from 'axios';
import { defineComponent, onMounted, ref } from 'vue';
import { CloseOutlined } from '@ant-design/icons-vue'
import TablePn from './components/tablePn.vue';
import { saveAs } from 'file-saver';

export default defineComponent({
  name: "App",
  props: {},
  components: {
    TablePn,
    CloseOutlined
  },
  setup() {
    const loading = ref(false);
    const loadingPage = ref(false);
    const partNumber = ref("");
    const listPartNumber = ref([]);
    const loadingDataTable = ref(false);
    const dataPnList = ref();
    const selectedRowKeys = ref([])
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
      loadingPage.value = true
      try {
        const res = await axios.post(`${clientUrl}/api/products/import`, {
          partNumbers: listPartNumber.value,
          parallel: true
        })
        if (res && res.status === 200) {
          alert('Ok!')
          localStorage.removeItem('savedPartNumbers');
          listPartNumber.value = []
          await getListPn();
        }
      } catch (err) {
        alert(err);
      } finally {
        loading.value = false
        loadingPage.value = false
      }
    }

    const getListPn = async () => {
      loadingDataTable.value = true
      loadingPage.value = true
      try {
        const res = await axios.get(`${clientUrl}/api/products/list`);
        if (res && res.status === 200) {
          if (res.data && res.data.data && res.data.data.length) {
            dataPnList.value = res.data.data;
          }
        }
      } catch (err) {
        console.log(err)
      } finally {
        loadingDataTable.value = false
        loadingPage.value = false
      }
    }

    const onInputPartNumber = () => {
      listPartNumber.value.push(partNumber.value)
      localStorage.setItem('savedPartNumbers', JSON.stringify(listPartNumber.value));
      partNumber.value = ""
    }

    const onDeletePn = (id) => {
      listPartNumber.value.splice(id, 1);
    }

    const onRowSelect = (row) => {
      selectedRowKeys.value = row.map(item => item.spnManufacturerPartNumber);
    }

    const onExportExel = async () => {
      loadingPage.value = true
      localStorage.removeItem('savedPartNumbers');
      try {
        const response = await axios({
          url: `${clientUrl}/api/products/export-xlsx`,
          method: 'POST',
          data: {
            partNumbers: selectedRowKeys.value
          },
          responseType: 'blob',
        });

        const blob = new Blob([response.data], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });
        saveAs(blob, 'ProductList.xlsx');
      } catch (error) {
        console.error('Export Excel failed:', error);
        alert('Export thất bại!');
      } finally {
        loadingPage.value = false
      }
    }

    const onExportCsv = () => {

    }
    onMounted(() => {
      const saved = localStorage.getItem('savedPartNumbers');
      console.log(saved, 'saved');
      if (saved) {
        listPartNumber.value = JSON.parse(saved);
      }
      getListPn();
    })
    return {
      loading,
      loadingPage,
      partNumber,
      listPartNumber,
      selectedRowKeys,
      dataPnList,
      loadingDataTable,
      onHandleSearch,
      onSearchPN,
      onInputPartNumber,
      onDeletePn,
      onRowSelect,
      onExportExel,
      onExportCsv
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
  width: 100%;
  flex-wrap: wrap;
}

.list-item-wrap {
  display: flex;
  justify-content: center;
  width: 80%;
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
  color: #242424;
  position: relative;
}

.table-wrap {
  padding: 40px;
}

.icon-delete {
  position: absolute;
  top: -25%;
  right: -3px;
  cursor: pointer;
  font-size: 10px;
}

.btn-wrap {
  display: flex;
  justify-content: end;
  margin-right: 40px;
}
</style>
