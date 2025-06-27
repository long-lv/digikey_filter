<template>
    <div>
    <a-modal v-model:open="isDisplay" title="Confirm Delete!!!" @ok="onSubmit" @cancel="onCancel" centered >
      <p>Có chắc muốn xóa hết data không ? </p>
    </a-modal>
  </div>
</template>
<script>
import { computed, defineComponent } from 'vue';

export default defineComponent({
    name: "Dialog Delete",
    props: {
        visible: {
            type: Boolean,
            default: false
        },
    },
    emits: ['onSubmitDelete', 'onCancel', 'isVisible'],
    setup(props, context) {
        const onSubmit = () => {
            context.emit('onSubmitDelete');
        }

        const onCancel = () => {
            context.emit('onCancel');
        }

        const isDisplay = computed({
            get: () => {
                return props.visible
            },
            set: (val) => {
                context.emit('isVisible', val)
            }
        })

        return {
            onSubmit,
            onCancel,
            isDisplay
        }
    }
})
</script>
