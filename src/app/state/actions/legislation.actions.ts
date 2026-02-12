import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { LegislationDTO, LegislationAnnotationDTO } from '../../models/legislation.model';

export const LegislationActions = createActionGroup({
  source: 'Legislation',
  events: {
    // Load legislations
    'Load All Legislations': emptyProps(),
    'Load Legislations By Status': props<{ status: string }>(),
    'Load Legislations Success': props<{ legislations: LegislationDTO[] }>(),
    'Load Legislations Failure': props<{ error: string }>(),

    // Load single legislation
    'Load Legislation': props<{ id: string }>(),
    'Load Legislation Success': props<{ legislation: LegislationDTO }>(),
    'Load Legislation Failure': props<{ error: string }>(),

    // Select legislation
    'Select Legislation': props<{ legislation: LegislationDTO }>(),
    'Clear Selected Legislation': emptyProps(),

    // Create legislation
    'Create Legislation': props<{ legislation: Partial<LegislationDTO> }>(),
    'Create Legislation Success': props<{ legislation: LegislationDTO }>(),
    'Create Legislation Failure': props<{ error: string }>(),

    // Update legislation
    'Update Legislation': props<{ id: string; legislation: Partial<LegislationDTO> }>(),
    'Update Legislation Success': props<{ legislation: LegislationDTO }>(),
    'Update Legislation Failure': props<{ error: string }>(),

    // Delete legislation
    'Delete Legislation': props<{ id: string }>(),
    'Delete Legislation Success': props<{ id: string }>(),
    'Delete Legislation Failure': props<{ error: string }>(),

    // Update status
    'Update Legislation Status': props<{ id: string; status: string }>(),
    'Update Legislation Status Success': props<{ legislation: LegislationDTO }>(),
    'Update Legislation Status Failure': props<{ error: string }>(),

    // Annotations
    'Load Annotations': props<{ legislationId: string; groupId?: string }>(),
    'Load Annotations Success': props<{ annotations: LegislationAnnotationDTO[] }>(),
    'Load Annotations Failure': props<{ error: string }>(),

    'Create Annotation': props<{ legislationId: string; annotation: Partial<LegislationAnnotationDTO> }>(),
    'Create Annotation Success': props<{ annotation: LegislationAnnotationDTO }>(),
    'Create Annotation Failure': props<{ error: string }>(),

    'Update Annotation': props<{ legislationId: string; annotationId: string; annotation: Partial<LegislationAnnotationDTO> }>(),
    'Update Annotation Success': props<{ annotation: LegislationAnnotationDTO }>(),
    'Update Annotation Failure': props<{ error: string }>(),

    'Delete Annotation': props<{ legislationId: string; annotationId: string }>(),
    'Delete Annotation Success': props<{ annotationId: string }>(),
    'Delete Annotation Failure': props<{ error: string }>(),
  },
});
