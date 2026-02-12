import { Routes } from '@angular/router';
import { HomePageComponent } from './components/home-page/home-page.component';

export const routes: Routes = [
    { path: '', component: HomePageComponent },
    // Policy Scoring (Legislation)
    { path: 'policy-scoring', loadComponent: () => import('./components/legislation/legislation-list/legislation-list.component').then(m => m.LegislationListComponent) },
    { path: 'policy-scoring/create', loadComponent: () => import('./components/legislation/legislation-editor/legislation-editor.component').then(m => m.LegislationEditorComponent) },
    { path: 'policy-scoring/:id', loadComponent: () => import('./components/legislation/legislation-detail/legislation-detail.component').then(m => m.LegislationDetailComponent) },
    { path: 'policy-scoring/:id/edit', loadComponent: () => import('./components/legislation/legislation-editor/legislation-editor.component').then(m => m.LegislationEditorComponent) },
    { path: 'policy-scoring/:id/annotate', loadComponent: () => import('./components/legislation/legislation-annotator/legislation-annotator.component').then(m => m.LegislationAnnotatorComponent) },
    // Scoring Components
    { path: 'competitive-scoring', loadComponent: () => import('./components/scoring/competitive-scoring/competitive-scoring.component').then(m => m.CompetitiveScoringComponent) },
    { path: 'solution-scoring', loadComponent: () => import('./components/scoring/solution-scoring/solution-scoring.component').then(m => m.SolutionScoringComponent) },
    // Competitor Components
    { path: 'political-competitors', loadComponent: () => import('./components/competitors/political-competitors/political-competitors.component').then(m => m.PoliticalCompetitorsComponent) },
    { path: 'professional-competitors', loadComponent: () => import('./components/competitors/professional-competitors/professional-competitors.component').then(m => m.ProfessionalCompetitorsComponent) },
    { path: 'policy-competitors', loadComponent: () => import('./components/competitors/policy-competitors/policy-competitors.component').then(m => m.PolicyCompetitorsComponent) },
    // Categories
    { path: 'political-categories', loadComponent: () => import('./components/political-categories/political-categories.component').then(m => m.PoliticalCategoriesComponent) },
    // Terms Components
    { path: 'terms', loadComponent: () => import('./components/terms/terms-page.component').then(m => m.TermsPageComponent) },
    { path: 'terms/create', loadComponent: () => import('./components/terms/term-creator/term-creator.component').then(m => m.TermCreatorComponent) },
    { path: 'terms/:id', loadComponent: () => import('./components/terms/view-term/view-term.component').then(m => m.ViewTermComponent) },
    { path: 'contextualized-terms/create', loadComponent: () => import('./components/terms/contextualized-term-creator/contextualized-term-creator.component').then(m => m.ContextualizedTermCreatorComponent) },
    // Worldview Election & Ballot Components
    { path: 'worldview-elections', loadComponent: () => import('./components/worldview-ballot/manage-elections/manage-elections.component').then(m => m.ManageElectionsComponent) },
    { path: 'worldview-elections/create', loadComponent: () => import('./components/worldview-ballot/election-creator/election-creator.component').then(m => m.ElectionCreatorComponent) },
    { path: 'worldview-elections/:electionId/debate', loadComponent: () => import('./components/debate/election-debate/election-debate.component').then(m => m.ElectionDebateComponent) },
    { path: 'worldview-ballots/create', loadComponent: () => import('./components/worldview-ballot/worldview-ballot-creator/worldview-ballot-creator.component').then(m => m.WorldviewBallotCreatorComponent) },
    { path: 'worldview-ballot', loadComponent: () => import('./components/worldview-ballot/worldview-ballot.component').then(m => m.WorldviewBallotComponent) },
    { path: 'browse-worldview-ballots', loadComponent: () => import('./components/worldview-ballot/browse-worldview-ballots/browse-worldview-ballots.component').then(m => m.BrowseWorldviewBallotsComponent) },
    // Informational Components
    { path: 'about-policy-scoring', loadComponent: () => import('./components/home-page/informational/policy-scoring-concepts/policy-scoring-concepts.component').then(m => m.PolicyScoringConceptsComponent) },
    { path: 'about-polari', loadComponent: () => import('./components/home-page/informational/about-polari/about-polari.component').then(m => m.AboutPolariComponent) },
    { path: 'about-scorecard', loadComponent: () => import('./components/home-page/informational/about-the-scorecard/about-the-scorecard.component').then(m => m.AboutTheScorecardComponent) },
    // User Group Components
    { path: 'professional-groups', loadComponent: () => import('./components/users/user-groups/professional-groups/professional-groups.component').then(m => m.ProfessionalGroupsComponent) },
    { path: 'political-groups', loadComponent: () => import('./components/users/user-groups/political-groups/political-groups.component').then(m => m.PoliticalGroupsComponent) },
    // User Components
    { path: 'user-info-bar', loadComponent: () => import('./components/users/user-info-bar/user-info-bar.component').then(m => m.UserInfoBarComponent) },
    { path: 'registration', loadComponent: () => import('./components/users/registration/registration.component').then(m => m.RegistrationComponent) },
];
