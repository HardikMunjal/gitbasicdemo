<template>
  <div>  
  <div class="relative home-bg">
    <div class="uk-container uk-container-medium uk-position-relative home-bg">
      <div uk-grid class="uk-column-1-1@s uk-column-1-2@m container-width">
        <div class="uk-margin-medium-top uk-width-expand@m">
          <h1 bx-attr="account-admin-name" class="account-admin-name mobile-hide"
            @mouseover="showTooltip('FirstName', $event)" @mouseout="hideTooltip()">
            {{getScreenText("LABEL_HI")}} {{userDetails && userDetails.firstName}}!</h1>
          <!-- Accordion-->
          <program-list />
        <!--Accordion-->  
        </div>
        <div class="uk-margin-medium-top uk-width-1-3@m uk-width-1-1@s professional-learning-right-section">
          <figure><img src="../../assets/images/dashboard/home_illustration.svg" alt=""></figure>
          <h1 bx-attr="account-admin-name" class="account-admin-name uk-visible@s uk-hidden@m uk-hidden@l"
            @mouseover="showTooltip('FirstName', $event)" @mouseout="hideTooltip()">
            {{getScreenText("LABEL_HI")}} {{userDetails && userDetails.firstName}}!</h1>
          <div class="home-right-links"><img src="../../assets/images/dashboard/professional_learning.svg" alt="professtional-learning-icon"><span bx-attr="navigate-desktop-label" @click="navigateProLerningUrl">Professional Learning <img alt="" class="uk-margin-small-left" src="../../assets/images/admin/black_arrow.svg" /></span>
          </div>
        </div>
        <div class="tooltip-new" :style="styleObj" v-if="(hoverText=='FirstName' && userDetails && userDetails.firstName && userDetails.firstName.length>24)">{{userDetails.firstName}}</div>
      </div>
    </div>
    </div>
    <div class="footer-illustration uk-margin-large-top">
      <div class="illustration-left"><img class="relative"
          src="../../assets/images/dashboard/footer_illustration_left.svg" alt="" /></div>
      <div class="illustration-center"><img src="../../assets/images/dashboard/footer_illustration_center.svg" alt="" />
      </div>
      <div class="illustration-right"><img src="../../assets/images/dashboard/footer_illustration_right.svg" alt="" />
      </div>
      <div class="mobile-illustration">
        <img src="../../assets/images/dashboard/Mobile_Illustration.svg" alt="" />
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import PartnerHome from "@/components/partnerHome/partnerHome";
export default PartnerHome;
</script>
<style lang="less" scoped src="./partnerHome.less"></style>