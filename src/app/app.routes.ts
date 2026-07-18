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
    // The REAL worldview scorer — group-hosted concept sets scored live by Polari's engine (replaces the retired client-side scorer).
    { path: 'worldview-scorer', loadComponent: () => import('./components/polari-worldview-scorer/polari-worldview-scorer.component').then(m => m.PolariWorldviewScorerComponent) },
    { path: 'worldview-ballot', loadComponent: () => import('./components/worldview-ballot/worldview-ballot.component').then(m => m.WorldviewBallotComponent) },
    { path: 'browse-worldview-ballots', loadComponent: () => import('./components/worldview-ballot/browse-worldview-ballots/browse-worldview-ballots.component').then(m => m.BrowseWorldviewBallotsComponent) },
    // Real Polari WorldviewElection results (read-only) — 2026-07-14 Phase 3a.
    { path: 'polari-elections/:name', loadComponent: () => import('./components/polari-election-results/polari-election-results.component').then(m => m.PolariElectionResultsComponent) },
    // Real Polari GroupDisplayVote results (read-only) — 2026-07-14 Phase 4b.
    { path: 'polari-display-votes/:name', loadComponent: () => import('./components/polari-display-vote-results/polari-display-vote-results.component').then(m => m.PolariDisplayVoteResultsComponent) },
    // Real Polari LogicForkVote results (read-only) — mechanism C, judicial-adjudication expansion.
    { path: 'polari-logic-fork-votes/:name', loadComponent: () => import('./components/polari-logic-fork-vote-results/polari-logic-fork-vote-results.component').then(m => m.PolariLogicForkVoteResultsComponent) },
    // Decision-procedure graph — forks + resolution state + edges, read-only summary (not the executable no-code graph).
    { path: 'decision-procedures/:name', loadComponent: () => import('./components/polari-decision-procedure-graph/polari-decision-procedure-graph.component').then(m => m.PolariDecisionProcedureGraphComponent) },
    // System-choice implications — outcome comparison by in-force criterion + evidence assertions.
    { path: 'system-choices/:fork', loadComponent: () => import('./components/polari-system-choice-outcomes/polari-system-choice-outcomes.component').then(m => m.PolariSystemChoiceOutcomesComponent) },
    // General scoring surface — concept score detail + policy/politician/cohort accountability scoring.
    { path: 'polari-concepts/:name/score', loadComponent: () => import('./components/polari-concept-score-detail/polari-concept-score-detail.component').then(m => m.PolariConceptScoreDetailComponent) },
    { path: 'accountability', loadComponent: () => import('./components/polari-accountability-hub/polari-accountability-hub.component').then(m => m.PolariAccountabilityHubComponent) },
    { path: 'policy-scores/:name', loadComponent: () => import('./components/polari-policy-score/polari-policy-score.component').then(m => m.PolariPolicyScoreComponent) },
    // Citizen-facing ScoreAssertion submission — routes through PSC's own authenticated backend, never direct to Polari.
    { path: 'policy-scores/:name/submit-assertion', loadComponent: () => import('./components/polari-assertion-submission/polari-assertion-submission.component').then(m => m.PolariAssertionSubmissionComponent) },
    { path: 'politician-scores/:name', loadComponent: () => import('./components/polari-politician-score/polari-politician-score.component').then(m => m.PolariPoliticianScoreComponent) },
    // Citizen-facing PolicyVote submission — dual-path authorized (policy-voting-admin + source, or politician/staff group membership).
    { path: 'politician-scores/:name/submit-vote', loadComponent: () => import('./components/polari-policy-vote-submission/polari-policy-vote-submission.component').then(m => m.PolariPolicyVoteSubmissionComponent) },
    { path: 'policy-votes/authorize-staff', loadComponent: () => import('./components/polari-authorize-staff/polari-authorize-staff.component').then(m => m.PolariAuthorizeStaffComponent) },
    { path: 'cohort-reports/:name', loadComponent: () => import('./components/polari-cohort-report/polari-cohort-report.component').then(m => m.PolariCohortReportComponent) },
    // DMV cost-of-living survival reports — the survival endpoints'
    // first frontend consumer (DMV plan §7 col-6).
    { path: 'survival', loadComponent: () => import('./components/polari-survival/polari-survival.component').then(m => m.PolariSurvivalComponent) },
    // Court cases (ncg-2): fork-by-fork adjudication through compiled
    // no-code decision procedures; writes proxied via PSC backend.
    { path: 'court-cases', loadComponent: () => import('./components/polari-court-cases/polari-court-cases.component').then(m => m.PolariCourtCasesComponent) },
    // Epistemics & trust hub — term proofs, term competition, credibility bases, source trust, legislation tracking (all read-only off Polari's live epistemics routes).
    { path: 'epistemics', loadComponent: () => import('./components/polari-epistemics/epistemics-hub/epistemics-hub.component').then(m => m.EpistemicsHubComponent) },
    { path: 'epistemics/proofs', loadComponent: () => import('./components/polari-epistemics/term-proofs-page/term-proofs-page.component').then(m => m.TermProofsPageComponent) },
    { path: 'epistemics/term-competition', loadComponent: () => import('./components/polari-epistemics/term-competition-page/term-competition-page.component').then(m => m.TermCompetitionPageComponent) },
    { path: 'epistemics/credibility', loadComponent: () => import('./components/polari-epistemics/credibility-page/credibility-page.component').then(m => m.CredibilityPageComponent) },
    { path: 'epistemics/sources', loadComponent: () => import('./components/polari-epistemics/sources-trust-page/sources-trust-page.component').then(m => m.SourcesTrustPageComponent) },
    { path: 'epistemics/legislation', loadComponent: () => import('./components/polari-epistemics/legislation-trust-page/legislation-trust-page.component').then(m => m.LegislationTrustPageComponent) },
    // Fork governance (mechanism C): create logic-fork votes, cast mode-aware ballots, wire decision-procedure edges.
    { path: 'governance', loadComponent: () => import('./components/polari-governance/polari-governance.component').then(m => m.PolariGovernanceComponent) },
    // Group ↔ Polari-instance authority: instance registry, both-sides
    // bindings, authority grants, term-availability signals + provenance.
    { path: 'authority', loadComponent: () => import('./components/authority/authority-hub/authority-hub.component').then(m => m.AuthorityHubComponent) },
    // PSC-hosted public votes — real ballot casting, PSC's own backend
    // (2026-07-14 Phase 3b ballot-hosting architecture move).
    { path: 'polari-votes', loadComponent: () => import('./components/polari-votes/polari-vote-list/polari-vote-list.component').then(m => m.PolariVoteListComponent) },
    { path: 'polari-votes/:id', loadComponent: () => import('./components/polari-votes/polari-vote-detail/polari-vote-detail.component').then(m => m.PolariVoteDetailComponent) },
    // Score choropleth map — 2026-07-14 Phase 4b, reuses PSC's own
    // existing stateGeoLocations boundary store + Polari's live score API.
    { path: 'score-map', loadComponent: () => import('./components/polari-score-map/polari-score-map.component').then(m => m.PolariScoreMapComponent) },
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
