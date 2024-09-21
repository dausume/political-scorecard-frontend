import { Routes } from '@angular/router';
import { HomePageComponent } from './components/home-page/home-page.component';
// Add imports for all components
import { AboutPolariComponent } from './components/informational/about-polari/about-polari.component';
import { PolicyScoringComponent } from './components/policy/policy-scoring/policy-scoring.component';
import { CompetitiveScoringComponent } from './components/scoring/competitive-scoring/competitive-scoring.component';
import { PoliticalCompetitorsComponent } from './components/competitors/political-competitors/political-competitors.component';
import { SolutionScoringComponent } from './components/scoring/solution-scoring/solution-scoring.component';
import { AboutTheScorecardComponent } from './components/informational/about-the-scorecard/about-the-scorecard.component';
import { UserInfoBarComponent } from './components/users/user-info-bar/user-info-bar.component';
import { RegistrationComponent } from './components/users/registration/registration.component';
import { ProfessionalGroupsComponent } from './components/users/user-groups/professional-groups/professional-groups.component';
import { PoliticalGroupsComponent } from './components/users/user-groups/political-groups/political-groups.component';
import { ProfessionalCompetitorsComponent } from './components/competitors/professional-competitors/professional-competitors.component';

export const routes: Routes = [
    { path: '', component: HomePageComponent },
    // Scoring Components
    { path: 'policy-scoring', component: PolicyScoringComponent },
    { path: 'competitive-scoring', component: CompetitiveScoringComponent },
    { path: 'solution-scoring', component: SolutionScoringComponent },
    // Competitor Components
    { path: 'political-competitors', component: PoliticalCompetitorsComponent },
    { path: 'professional-competitors', component: ProfessionalCompetitorsComponent },
    // Informational Components
    { path: 'about-polari', component: AboutPolariComponent },
    { path: 'about-scorecard', component: AboutTheScorecardComponent },
    // User Group Components
    {path: 'professional-groups', component: ProfessionalGroupsComponent },
    {path: 'political-groups', component: PoliticalGroupsComponent },
    // User Components
    { path: 'user-info-bar', component: UserInfoBarComponent },
    { path: 'registration', component: RegistrationComponent }

];