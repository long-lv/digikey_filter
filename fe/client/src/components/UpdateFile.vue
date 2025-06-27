<template>
    <a-upload v-model:file-list="fileList" name="file" :beforeUpload="beforeUpload"
        :headers="headers" @change="handleChange">
        <a-button>
            <upload-outlined></upload-outlined>
            Click to Upload file
        </a-button>
    </a-upload>
</template>
<script>
import { computed, defineComponent, ref } from 'vue';
import * as XLSX from 'xlsx'
export default defineComponent({
    name: "Upload File",
    props: {

    },
    emits: ['onUpLoad'],
    setup(props, context) {
        const fileList = ref([])
        const beforeUpload = (file) => {
            readExcelFile(file)
            return false 
        }


        const readExcelFile = (file) => {
            const reader = new FileReader()

            reader.onload = async (e) => {
                const data = new Uint8Array(e.target.result)
                const workbook = XLSX.read(data, { type: 'array' })

                const sheet = workbook.Sheets[workbook.SheetNames[0]]
                const jsonData = XLSX.utils.sheet_to_json(sheet)
                console.log(jsonData, 'jsonData');
                const partNumbers = jsonData
                    .map(row => row.Partnumber)
                    .filter(Boolean)

                console.log('Danh sách partNumber:', partNumbers)
                context.emit('onUpLoad', partNumbers)
                // for (const partNumber of partNumbers) {
                //     try {
                //         const res = await axios.get(`/api/your-endpoint?partNumber=${partNumber}`)
                //         console.log(res.data)
                //     } catch (err) {
                //         console.error('Lỗi gọi API:', err)
                //     }
                // }
            }

            reader.readAsArrayBuffer(file)
        }

        return {
            fileList,
            beforeUpload
        }
    }
})
</script>