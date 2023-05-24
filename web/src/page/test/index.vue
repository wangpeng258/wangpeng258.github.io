<template>
    <div class="testPage">
        <h1>testPage</h1>
    </div>
</template>

<script>
import { isObjEmpty } from '@/libs/utils';
export default {

    data() {
        return {

        };
    },
    mounted() {

    },
    methods: {
        isEmpty(e) {
            return isObjEmpty(e)
        },
    },
};
</script>
<style lang="less" scoped>
.testPage {}
</style>
