<template>
<div>
    <!-- Accordion-->
    <div class="main-accordion">
        <div class="main-accordion-header" v-if="!showEmptyState && (programsList.length || drilledProgram)">
            <div @click="sortByProgramName" class="main-accordion-section-header relative" :class="[!filteredByStar && 'filter-program']"  bx-attr="program-text">
                Program Name
            </div>
            <span @click="sortByStar(0,0)" class="starred-filter" :class="[filteredByStar && 'filtered-star']"  bx-attr="starred-filter"></span>
        </div>
        <ul bx-attr="accordion" class="uk-accordion"  id="accordion-container">
            <li v-if="drilledProgram" :class="[selectedProgramIndex!=drilledProgram.programId ? 'close-accordion': 'open-accordion']">
             <span class="accordion-row"  :class="drilledProgram && drilledProgram.siteStarInfos && !drilledProgram.siteStarInfos.length && programsList.length<1 && 'hideBorder'">
                 <a @click="toggleProgramTab(drilledProgram.programId)" href="javascript:void(0)" class="uk-expand-collapse" 
                 :class="[selectedProgramIndex==drilledProgram.programId && 'collapse',(!drilledProgram.siteStarInfos || !drilledProgram.siteStarInfos.length) && 'disabled opacity lowOpacity']"></a>
                 <a href="javascript:void(0)" class="name-column" :class="[!drilledProgram.isAccessible && 'disabled']" @click="navigateToRole(drilledProgram.programId)" @mouseover="showTooltip(drilledProgram.programName, $event, 'drilledProgram')" @mouseout="hideTooltip()">{{ drilledProgram.programName && drilledProgram.programName.substring(0,40).trim() }}{{(drilledProgram.programName && drilledProgram.programName.length > 40) ? '...' : ''}}</a>
                 <div bx-attr="program-name-tooltip" id="hoverProgramElement" 
                     v-if="hoverText.length > 40 && hover && hoverText == drilledProgram.programName" 
                     :style="hoverStyleObj" class="tooltip-new hover-Title">
                   {{ drilledProgram.programName }}
                 </div>
                 <span @click="drilledProgram.isStar=!drilledProgram.isStar;sortByStar(drilledProgram.programId, 0)" 
                 class="site-starred-icon" :class="[drilledProgram.isStar && 'active']"></span>
             </span>
             <div class="uk-accordion-content relative site-row" v-if="drilledProgram.siteStarInfos && drilledProgram.siteStarInfos.length">
                 <!--Accordion Content-->
                 <div class="accordion-row" v-for="(site, siteIndex) in drilledProgram.siteStarInfos" :key="siteIndex" :class="[drilledProgram && drilledProgram.siteStarInfos && drilledProgram.siteStarInfos.length-1==siteIndex && programsList.length<1 && 'hideBorder']">
                 <a href="javascript:void(0)" class=""></a>
                 <a href="javascript:void(0)" @click="navigateToRole(drilledProgram.programId, site.siteId)" class="name-column site-name" 
                     @mouseover="showTooltip(site.siteName, $event, 'drilledProgramSite')" @mouseout="hideTooltip()">
                     {{ site.siteName.substring(0,40).trim() }}{{site.siteName.length > 40 ? '...' : ''}}
                 </a>
                 <div bx-attr="site-name-tooltip" id="hoverSiteElement" v-if="hoverText.length > 40 && hover && hoverText ==site.siteName" 
                     :style="hoverStyleObj" class="tooltip-new hover-Title">
                   {{ site.siteName }}
                 </div>
                 <span class="site-starred-icon" @click="site.isStar=!site.isStar;sortByStar(drilledProgram.programId, site.siteId)" 
                 :class="[site.isStar && 'active']"></span>
                 </div>
             </div>
            </li>

            <li bx-attr="program-list" v-for="(program, index) in programsList" :key="program.programId" :class="[selectedProgramIndex!=program.programId || !program.siteStarInfos.length ? 'close-accordion': 'open-accordion']">
            <span bx-attr="accordion-row" class="accordion-row" :class="[(program && program.siteStarInfos && program.siteStarInfos.length==0 || programsList.length-1==index && program && program.siteStarInfos && program.siteStarInfos.length==0 || selectedProgramIndex!=program.programId && programsList.length-1==index) && programsList.length!=1 && programsList.length-1==index && 'hideBorder']">
                <a @click="toggleProgramTab(program.programId)" href="javascript:void(0)" class="uk-expand-collapse" :class="[selectedProgramIndex==program.programId && program.siteStarInfos.length && 'collapse', !program.siteStarInfos.length && 'disabled opacity lowOpacity']"></a>
                <a href="javascript:void(0)" @click="navigateToRole(program.programId)" class="name-column" :class="[!program.isAccessible && 'disabled']" @mouseover="showTooltip(program.programName, $event, 'programName')" @mouseout="hideTooltip()">{{program.programName.substring(0,40).trim() }}{{program.programName.length > 40 ? '...' : ''}}</a>
                <div bx-attr="program-name-tooltip" id="hoverProgramElement" v-if="hoverText.length > 40 && hover && hoverText == program.programName" :style="hoverStyleObj" class="tooltip-new hover-Title">
                  {{ program.programName }}
                </div>
                <span @click="program.isStar=!program.isStar;sortByStar(program.programId, 0);" class="site-starred-icon" :class="[program.isStar && 'active']"></span>
            </span>
            <div class="uk-accordion-content relative site-row" v-if="program.siteStarInfos.length">
                <!--Accordion Content-->
                <div class="accordion-row" v-for="(site, siteIndex) in program.siteStarInfos" :key="siteIndex" :class="(program && program.siteStarInfos && program.siteStarInfos.length-1==siteIndex && programsList.length-1==index ) && 'hideBorder'">
                <a href="javascript:void(0)" class=""></a>
                <a href="javascript:void(0)" @click="navigateToRole(program.programId, site.siteId)" class="name-column site-name" @mouseover="showTooltip(site.siteName, $event, 'ProgramSites')" @mouseout="hideTooltip()">{{ site.siteName.substring(0,40).trim() }}{{site.siteName.length > 40 ? '...' : ''}}</a>
                <div bx-attr="site-name-tooltip" id="hoverSiteElement" v-if="hoverText.length > 40 && hover && hoverText ==site.siteName" :style="hoverStyleObj" class="tooltip-new hover-Title">
                  {{ site.siteName }}
                </div>
                <span class="site-starred-icon" @click="site.isStar=!site.isStar;sortByStar(program.programId, site.siteId);" :class="[site.isStar && 'active']"></span>
                </div>
            </div>
            </li>
        </ul>
    </div>
    <!--Accordion--> 
    <div class="empty-view relative" v-if="showEmptyState" >
            <img src="@/assets/images/dashboard/empty_state_icon.svg" alt="Empty">  
            <span bx-attr="welcome-text">{{getScreenText("LABEL_WELCOME_2")}}</span>
            <span bx-attr="empty-text2" v-if="currentRoleId==localConstant.ROLE_TYPE_ACCOUNT_ADMIN">
              {{getScreenText("ACCOUNT_ADMIN_EMPTY_STATE_MSG")}}
            </span>
            <span bx-attr="empty-text2" v-else>
              {{getScreenText("PA_SA_STAFF_EMPTY_STATE_MSG")}}
            </span>
    </div>
</div>
</template>

<script lang="ts">
import ProgramList from "@/components/partnerHome/components/programList/ProgramList";
export default ProgramList;
</script>
<style lang="less" scoped src="./ProgramList.less"></style>