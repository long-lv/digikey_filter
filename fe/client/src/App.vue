<template>
  <a-spin :spinning="loadingPage" size="large" tip="Loading..." class="fullscreen-spin">
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
          <a-tag v-for="(pn, id) in listPartNumber" class="list-item" color="geekblue" closable @close="onDeletePn(id)"
            :key="id">
            {{ pn }}
          </a-tag>
        </div>
      </div>
      <div class="btn-wrap">
        <a-button type="primary" @click="onExportExel" :disabled="!selectedRowKeys.length">Export Exel</a-button>
        <div style="margin-left: 10px;">
          <UpdateFile @on-up-load="handleUpdateFile"></UpdateFile>
        </div>
        <div>
           <a-button type="primary" danger @click="getListPn({sortBy: 'asc'})" style="margin-left: 10px;">Sort by ASC</a-button>
           <a-button danger @click="getListPn({sortBy: 'desc'})" style="margin-left: 10px;">Sort by DESC</a-button>
           <a-button warning @click="visibleDialogDelete = true" style="margin-left: 10px;">Delete All</a-button>
        </div>
      </div>
      <div class="table-wrap">
        <TablePn :loading-api="loadingDataTable" :data="dataPnList" @on-row-select="onRowSelect"
          :pagination="pagination" :selected-rows="selectedRowKeys" @page-change="handlePageChange"></TablePn>
      </div>
      <DialogDeleteConfirm v-model:visible="visibleDialogDelete" @onSubmitDelete="handleSubmitDeleteAll" @onCancel="visibleDialogDelete = false"/>
    </div>
  </a-spin>
</template>
<script>
import axios from 'axios';
import { defineComponent, onMounted, ref } from 'vue';
import { CloseOutlined } from '@ant-design/icons-vue'
import TablePn from './components/TablePn.vue';
import { saveAs } from 'file-saver';
import UpdateFile from './components/UpdateFile.vue';
import DialogDeleteConfirm from './components/DialogDeleteConfirm.vue';

export default defineComponent({
  name: "App",
  props: {},
  components: {
    TablePn,
    UpdateFile,
    DialogDeleteConfirm,
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
    const visibleDialogDelete = ref(false);
    const pagination = ref({
      current: "",
      pageSize: "",
      total: "",
      page: "",
      showTotal: total => `Total ${total} items`,
    })
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

    const getListPn = async ({page = "", limit = 20, sortBy='asc'} = {}) => {
      loadingDataTable.value = true
      loadingPage.value = true
      try {
        const res = await axios.get(`${clientUrl}/api/products/list`, {
          params: { page, limit, sortBy }
        });
        if (res && res.status === 200) {
          if (res.data && res.data.data && res.data.data.length) {
            dataPnList.value = res.data.data;
            pagination.value = { ...res.data.pagination }
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
      if (partNumber.value && partNumber.value.length > 0) {
        listPartNumber.value.push(partNumber.value)
        localStorage.setItem('savedPartNumbers', JSON.stringify(listPartNumber.value));
        partNumber.value = ""
      } else {
        alert('nhập PN')
      }
    }

    const onDeletePn = (id) => {
      listPartNumber.value.splice(id, 1);
    }

    const onRowSelect = (row) => {
      const selectedRow = row.map(item => item.spnManufacturerPartNumber);
      selectedRowKeys.value.push(selectedRow);
      console.log(selectedRowKeys.value, 'select row');
    }

    const onExportExel = async () => {
      loadingPage.value = true
      localStorage.removeItem('savedPartNumbers');
      try {
        const response = await axios({
          url: `${clientUrl}/api/products/export-xlsx`,
          method: 'POST',
          data: {
            partNumbers: selectedRowKeys.value.flat()
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

    const handleUpdateFile = (listPN) => {
      listPartNumber.value = [...listPN];
    }

    const handlePageChange = (pagination) => {
      getListPn({page: pagination?.page, limit: pagination?.limit})
    }

    const handleSubmitDeleteAll = async () => {
      loadingPage.value = true
      try{
        await axios.delete(`${clientUrl}/api/products/delete-all`)
        alert('Delete Ok')
      } catch(err) {
        console.error('Export Excel failed:', err);
      } 
      finally {
        loadingPage.value = false
      }
    }

    onMounted(() => {
      const saved = localStorage.getItem('savedPartNumbers');
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
      pagination,
      visibleDialogDelete,
      handleSubmitDeleteAll,
      getListPn,
      handlePageChange,
      onHandleSearch,
      onSearchPN,
      onInputPartNumber,
      onDeletePn,
      onRowSelect,
      onExportExel,
      onExportCsv,
      handleUpdateFile
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
  min-width: 700px;
  flex-wrap: wrap;
}

.list-item-wrap {
  display: flex;
  justify-content: center;
  width: 100%;
  flex-wrap: wrap;
}

.list-item {
  margin-left: 10px;
  margin-bottom: 10px;
  width: fit-content;
  background-color: bisque;
  border-radius: 4px;
  border: 1px solid #FAFAFA;
  padding: 5px 10px;
  color: #242424;
  position: relative;
  font-weight: 500;
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
