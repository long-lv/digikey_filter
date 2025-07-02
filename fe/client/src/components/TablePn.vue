<template>
    <div>
        <a-table :columns="columns" :data-source="data" :row-selection="rowSelection"
            :row-key="'spnManufacturerPartNumber'" :scroll="{ x: '1200px', y: 600 }" :loading="loadingApi"
            :pagination="tablePagination" @change="handleTableChange" />
    </div>
</template>
<script>
import { defineComponent, h, computed, render } from 'vue';
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
        },
        pagination: {
            type: Object,
            default: () => { }
        }
    },
    emits: [
        "onRowSelect",
        "onRowSelectAll",
        "pageChange"
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
                title: 'Id',
                dataIndex: 'id',
                key: 'id',
                width: '60px',
                align: 'center',
            },
            {
                title: 'Part Number',
                dataIndex: 'partNumber',
                key: 'partNumber',
                width: '200px',
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
                title: 'Quantity',
                dataIndex: 'quantity',
                key: 'quantity',
                width: '150px',
                align: 'right',
                // sorter: (a, b) => a.price1 - b.price1,
                // customRender: ({ text }) => text != null ? text.toFixed(2) : '-'
            },
            {
                title: 'Unit Price (USD)',
                dataIndex: 'unitPrice',
                key: 'unitPrice',
                width: '150px',
                align: 'right',
                // sorter: (a, b) => a.price1 - b.price1,
                // customRender: ({ text }) => text != null ? text.toFixed(2) : '-'
            },
            {
                title: 'Total Price (USD)',
                dataIndex: 'totalPrice',
                key: 'totalPrice',
                width: '150px',
                align: 'right',
                // sorter: (a, b) => a.price1 - b.price1,
                // customRender: ({ text }) => text != null ? text.toFixed(2) : '-'
            },
            {
                title: 'Packaging',
                dataIndex: 'packaging',
                key: 'packaging',
                width: '200px',
                customRender: ({ text }) => {
                    if (!text) return '';
                    return {
                        children: h(
                            'span',
                            {
                                innerHTML: text
                                    .split(';')
                                    .filter((item) => item.trim() !== '')
                                    .map((item) => item.trim())
                                    .join('<br/>')
                            }
                        )
                    };
                }
            },
            {
                title: 'Operating Temp Min',
                dataIndex: 'operatingTemperatureMin',
                key: 'operatingTemperatureMin',
                width: '120px'
            },
            {
                title: 'Operating Temp Max',
                dataIndex: 'operatingTemperatureMax',
                key: 'operatingTemperatureMax',
                width: '120px'
            },
            {
                title: 'Touch Panel',
                dataIndex: 'touchPanel',
                key: 'touchPanel',
                width: '120px'
            },
            {
                title: 'Module Size',
                dataIndex: 'moduleSize',
                key: 'moduleSize',
                width: '120px'
            },
            {
                title: 'IlluminationColor',
                dataIndex: 'illuminationColor',
                key: 'illuminationColor',
                width: '120px'
            },
            {
                title: 'Wave Length',
                dataIndex: 'waveLength',
                key: 'waveLength',
                width: '120px'
            },
            {
                title: 'If Forward Current',
                dataIndex: 'ifForwardCurrent',
                key: 'ifForwardCurrent',
                width: '120px'
            },
            {
                title: 'Vf Forward Voltage',
                dataIndex: 'vfForwardVoltage',
                key: 'vfForwardVoltage',
                width: '120px'
            },
            {
                title: 'Type',
                dataIndex: 'type',
                key: 'type',
                width: '120px'
            },
            {
                title: 'Qualification',
                dataIndex: 'qualification',
                key: 'qualification',
                width: '120px'
            },
            {
                title: 'Dimensions',
                dataIndex: 'dimensions',
                key: 'dimensions',
                width: '120px'
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
                title: 'Status',
                dataIndex: 'partStatus',
                key: 'partStatus',
                width: '100px'
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

        const tablePagination = computed(() => ({
            current: props.pagination?.page || 1,
            pageSize: props.pagination?.limit || 20,
            total: props.pagination?.total || 0,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50', '100'],
            showTotal: (total) => `Total ${total} items`,
        }))

        const handleTableChange = (pagination) => {
            context.emit("pageChange", {
                page: pagination.current,
                limit: pagination.pageSize,
            });
        };

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
            tablePagination,
            handleTableChange,
        }
    }
})
</script>