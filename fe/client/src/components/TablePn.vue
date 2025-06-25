<template>
    <div>
        <a-table :columns="columns" :data-source="data" 
            :row-selection="rowSelection"
            :row-key="'spnManufacturerPartNumber'"
            :scroll="{ x: '1200px', y: 600 }"
            :loading="loadingApi" 
            :pagination="{ pageSize: 20 }"
        />
    </div>
</template>
<script>
import { defineComponent, h, ref, computed } from 'vue';
export default defineComponent({
    name: 'TablePn',
    props: {
        data: {
            type: Array,
            default: () => []
        },
        loadingApi: {
            type: Boolean
        },
        selectedRows: {
            type: Array,
            default: () => []
        }
    },
    emits: [
        "onRowSelect",
        "onRowSelectAll"
    ],
    setup(props, context) {
        const columns = [
            {
                title: 'STT',
                key: 'index',
                width: '60px',
                align: 'center',
                customRender: ({ index }) => index + 1
            },
            {
                title: 'Mouser PN',
                dataIndex: 'spnMouserPartNumFormattedForProdInfo',
                key: 'spnMouserPartNumFormattedForProdInfo',
                width: '200px',
                ellipsis: true
            },
            {
                title: 'Mfr Part Number',
                dataIndex: 'spnManufacturerPartNumber',
                key: 'spnManufacturerPartNumber',
                width: '200px',
                ellipsis: true
            },
            {
                title: 'Manufacturer',
                dataIndex: 'manufacturer',
                key: 'manufacturer',
                width: '150px',
                ellipsis: true
            },
            {
                title: 'Image',
                dataIndex: 'defaultImg',
                key: 'defaultImg',
                width: '150px',
                customRender: ({ text }) =>
                    h('img', { src: text, alt: 'img', style: 'width:40px; height:auto;' })
            },
            {
                title: 'Datasheet',
                dataIndex: 'datasheet',
                key: 'datasheet',
                width: '400px',
                // customRender: ({ text }) =>
                //     text
                //         ? h('a', { href: text, target: '_blank', rel: 'noopener' }, 'View')
                //         : '-'
            },
            {
                title: 'Product',
                dataIndex: 'product',
                key: 'product',
                width: '200px',
                ellipsis: true
            },
            {
                title: 'Product Classification',
                dataIndex: 'productClassification',
                key: 'productClassification',
                width: '300px',
                ellipsis: true
            },
            {
                title: 'Price (USD)',
                dataIndex: 'price1',
                key: 'price1',
                width: '150px',
                align: 'right',
                // sorter: (a, b) => a.price1 - b.price1,
                // customRender: ({ text }) => text != null ? text.toFixed(2) : '-'
            },
            {
                title: 'Description',
                dataIndex: 'spnDescription',
                key: 'spnDescription',
                width: '200px',
                ellipsis: { showTitle: false }
            },
            {
                title: 'Series',
                dataIndex: 'series',
                key: 'series',
                width: '80px'
            },
            {
                title: 'Packaging',
                dataIndex: 'packaging',
                key: 'packaging',
                width: '100px'
            },
            {
                title: 'Status',
                dataIndex: 'partStatus',
                key: 'partStatus',
                width: '100px'
            },
            {
                title: 'Operating Temp.',
                dataIndex: 'operatingTemperature',
                key: 'operatingTemperature',
                width: '120px'
            },
            {
                title: 'Mount Type',
                dataIndex: 'mountingType',
                key: 'mountingType',
                width: '100px'
            },
            {
                title: 'Package/Case',
                dataIndex: 'packageOrCase',
                key: 'packageOrCase',
                width: '120px'
            },
            {
                title: 'Channels',
                dataIndex: 'numberOfChannels',
                key: 'numberOfChannels',
                width: '80px',
                customRender: ({ text }) => text ?? '-'
            },
            {
                title: 'Interface',
                dataIndex: 'interface',
                key: 'interface',
                width: '80px',
                customRender: ({ text }) => text ?? '-'
            },
            {
                title: 'Voltage Supply',
                dataIndex: 'voltageSupply',
                key: 'voltageSupply',
                width: '100px',
                customRender: ({ text }) => text ?? '-'
            },
            {
                title: 'Voltage Input',
                dataIndex: 'voltageInput',
                key: 'voltageInput',
                width: '100px',
                customRender: ({ text }) => text ?? '-'
            },
            {
                title: 'Voltage Output',
                dataIndex: 'voltageOutput',
                key: 'voltageOutput',
                width: '100px',
                customRender: ({ text }) => text ?? '-'
            },
            {
                title: 'Connector',
                dataIndex: 'connectorType',
                key: 'connectorType',
                width: '100px',
                customRender: ({ text }) => text ?? '-'
            },
            {
                title: 'Impedance',
                dataIndex: 'impedance',
                key: 'impedance',
                width: '80px',
                customRender: ({ text }) => text ?? '-'
            }
        ];
        
        const rowSelection = computed(() => ({
            selectedRow: props.selectedRows,
            onChange: (selectedRowKeys, selectedRows) => {
                context.emit('onRowSelect', selectedRows);
            },
            onSelect: (record, selected, selectedRows) => {
                context.emit('onRowSelect', selectedRows);
            },
        }));
        return {
            columns,
            rowSelection,
        }
    }
})
</script>