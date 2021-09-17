<template>
    <div class="newAcLogoImage homeComponentPgae">
    <div class="welcome-content-top">
    
        <h1 class="uk-modal-title header-title">{{getScreenText("LBL_HOMEPAGE")}}</h1>
    </div>
    <div class="height-center">
    <div class="link_table" v-if="getLmsInfo.status === 200">
          <table class="uk-table uk-table-small uk-table-divider" aria-describedby="lms links">
          <thead>
            <tr>
              <th scope>{{getScreenText("LBL_LINK")}}</th>
              <th scope>{{getScreenText("LBL_ACTION")}}</th>
            </tr>
          </thead>
          <tbody>
          <tr
          v-for="(link, index) in getLmsInfo.data"
          :key="index"
          class="pass-link uk-margin uk-margin-left uk-margin-right uk-margin-top"
          >
          <td>{{label_text[index]}}</td>
          <td>
          <a :href="link.urlJwt" target="_blank" rel="noopener noreferrer" class="linkbtn">{{getScreenText("VIEW_LINK")}}</a>
          </td>
          </tr>
          </tbody>
          </table>
    </div>
    <div
    v-if="navigatePlannerPage"
    class="pass-link nextBtn uk-margin uk-margin-left uk-margin-right uk-margin-top"
    >
    <a
    href="javascript:void(0)"
    @click="navigateToPlannerPage()"
    >{{getScreenText("PLANNER_PAGE")}}</a>
    </div>
    </div>
    </div>
</template>
<script lang="ts">
import HomeComponent from "@/components/homecomponent/HomeComponent";
export default HomeComponent;
</script>
<style lang="less" scoped src="./HomeComponent.less"></style>