<template>
    <div class="root-component">
        <account-list :currentRoleId="currentRoleId"  :userDetails="userDetails" @updateDataLayer='updateDataLayer' v-if="(currentRoleId === 1) || (currentRoleId === 2)"></account-list>
        <admin-dashboard :currentRoleId="currentRoleId" :userDetails="userDetails" @updateDataLayer='updateDataLayer' :signalRStrip="signalRStrip" v-if="(currentRoleId === 5) || (currentRoleId === 6)|| (currentRoleId === 7)"></admin-dashboard>
    </div>
</template>
<script lang="ts">
import RootComponent from "@/components/rootcomponent/RootComponent";
export default RootComponent;
</script>
