import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { WorldviewElectionDTO } from '../../services/api/worldview-elections-api.service';

export const ElectionsActions = createActionGroup({
  source: 'Elections',
  events: {
    // Load elections
    'Load All Elections': emptyProps(),
    'Load Active Elections': emptyProps(),
    'Load Elections By Status': props<{ status: string }>(),
    'Load Elections Started': emptyProps(),
    'Load Elections Success': props<{ elections: WorldviewElectionDTO[] }>(),
    'Load Elections Failure': props<{ error: string }>(),

    // Load single election
    'Load Election': props<{ electionId: string }>(),
    'Load Election Success': props<{ election: WorldviewElectionDTO }>(),
    'Load Election Failure': props<{ error: string }>(),

    // Select election
    'Select Election': props<{ election: WorldviewElectionDTO }>(),
    'Clear Selected Election': emptyProps(),

    // Create election
    'Create Election': props<{ election: WorldviewElectionDTO }>(),
    'Create Election Success': props<{ election: WorldviewElectionDTO }>(),
    'Create Election Failure': props<{ error: string }>(),

    // Update election
    'Update Election': props<{ electionId: string; election: WorldviewElectionDTO }>(),
    'Update Election Success': props<{ election: WorldviewElectionDTO }>(),
    'Update Election Failure': props<{ error: string }>(),

    // Delete election
    'Delete Election': props<{ electionId: string }>(),
    'Delete Election Success': props<{ electionId: string }>(),
    'Delete Election Failure': props<{ error: string }>(),

    // Close election
    'Close Election': props<{ electionId: string }>(),
    'Close Election Success': props<{ election: WorldviewElectionDTO }>(),
    'Close Election Failure': props<{ error: string }>(),
  },
});
