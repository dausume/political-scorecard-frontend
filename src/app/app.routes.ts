import { Routes } from '@angular/router';
import { HomePageComponent } from './components/home-page/home-page.component';
// Add imports for all components
import { AboutPolariComponent } from './components/home-page/informational/about-polari/about-polari.component';
import { PolicyScoringComponent } from './components/scoring/policy-scoring/policy-scoring.component';
import { CompetitiveScoringComponent } from './components/scoring/competitive-scoring/competitive-scoring.component';
import { PoliticalCompetitorsComponent } from './components/competitors/political-competitors/political-competitors.component';
import { SolutionScoringComponent } from './components/scoring/solution-scoring/solution-scoring.component';
import { AboutTheScorecardComponent } from './components/home-page/informational/about-the-scorecard/about-the-scorecard.component';
import { UserInfoBarComponent } from './components/users/user-info-bar/user-info-bar.component';
import { RegistrationComponent } from './components/users/registration/registration.component';
import { ProfessionalGroupsComponent } from './components/users/user-groups/professional-groups/professional-groups.component';
import { PoliticalGroupsComponent } from './components/users/user-groups/political-groups/political-groups.component';
import { ProfessionalCompetitorsComponent } from './components/competitors/professional-competitors/professional-competitors.component';
import { PolicyCompetitorsComponent } from './components/competitors/policy-competitors/policy-competitors.component';
import { PoliticalCategoriesComponent } from './components/political-categories/political-categories.component';
import { WorldviewBallotComponent } from './components/worldview-ballot/worldview-ballot.component';
import { BrowseWorldviewBallotsComponent } from './components/worldview-ballot/browse-worldview-ballots/browse-worldview-ballots.component';
import { ManageElectionsComponent } from './components/worldview-ballot/manage-elections/manage-elections.component';
import { ElectionCreatorComponent } from './components/worldview-ballot/election-creator/election-creator.component';
import { WorldviewBallotCreatorComponent } from './components/worldview-ballot/worldview-ballot-creator/worldview-ballot-creator.component';
import { TermsPageComponent } from './components/terms/terms-page.component';
import { ViewTermComponent } from './components/terms/view-term/view-term.component';
import { TermCreatorComponent } from './components/terms/term-creator/term-creator.component';
import { ContextualizedTermCreatorComponent } from './components/terms/contextualized-term-creator/contextualized-term-creator.component';

export const routes: Routes = [
    { path: '', component: HomePageComponent },
    // Scoring Components
    { path: 'policy-scoring', component: PolicyScoringComponent },
    { path: 'competitive-scoring', component: CompetitiveScoringComponent },
    { path: 'solution-scoring', component: SolutionScoringComponent },
    // Competitor Components
    { path: 'political-competitors', component: PoliticalCompetitorsComponent },
    { path: 'professional-competitors', component: ProfessionalCompetitorsComponent },
    { path: 'policy-competitors', component: PolicyCompetitorsComponent },
    // Categories
    { path: 'political-categories', component: PoliticalCategoriesComponent },
    // Terms Components
    { path: 'terms', component: TermsPageComponent },
    { path: 'terms/create', component: TermCreatorComponent },
    { path: 'terms/:id', component: ViewTermComponent },
    { path: 'contextualized-terms/create', component: ContextualizedTermCreatorComponent },
    // Worldview Election & Ballot Components
    { path: 'worldview-elections', component: ManageElectionsComponent },
    { path: 'worldview-elections/create', component: ElectionCreatorComponent },
    { path: 'worldview-ballots/create', component: WorldviewBallotCreatorComponent },
    { path: 'worldview-ballot', component: WorldviewBallotComponent },
    { path: 'browse-worldview-ballots', component: BrowseWorldviewBallotsComponent },
    // Informational Components
    { path: 'about-polari', component: AboutPolariComponent },
    { path: 'about-scorecard', component: AboutTheScorecardComponent },
    // User Group Components
    { path: 'professional-groups', component: ProfessionalGroupsComponent },
    { path: 'political-groups', component: PoliticalGroupsComponent },
    // User Components
    { path: 'user-info-bar', component: UserInfoBarComponent },
    { path: 'registration', component: RegistrationComponent }

];