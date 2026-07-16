import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PolariScoringService } from '../../services/polari/polari-scoring.service';
import {
  ResolvedDecisionProcedure,
  ResolvedDecisionFork,
  DecisionProcedureGraphEdge,
} from '../../models/polari-scoring/polari-scoring-types';

/** One node in the rendered flowchart tree — either a fork (a
 *  decision point, with its candidate criteria and resolution) or a
 *  terminal (ACQUITTAL / CONVICTION / SENTENCE_IMPOSED / etc.). Built
 *  client-side from the flat `forks[]` + `edges[]` the backend
 *  returns, since `resolved_procedure_summary()` reports a graph's
 *  raw edge list, not a pre-walked tree. */
interface ProcedureTreeNode {
  key: string;
  kind: 'fork' | 'terminal';
  label: string;
  /** The outcome label on the edge that led here (e.g. 'ACQUITTAL'),
   *  null for the tree's root nodes reached from the true start. */
  outcome: string | null;
  edgeDescription: string;
  fork?: ResolvedDecisionFork;
  children: ProcedureTreeNode[];
}

/**
 * Visualizes a Polari DecisionProcedure as a flowchart: forks (with
 * their candidate criteria + which one is currently resolved, and
 * why — vote-derived or incumbent default) connected by
 * DecisionProcedureEdges down to terminal outcomes.
 *
 * This is a READ-ONLY summary view, not Polari's executable no-code
 * graph (see JUDICIAL_ADJUDICATION_GRAPH_PLAN.md for why those are
 * different things and the latter is stashed, not built).
 */
@Component({
  selector: 'app-polari-decision-procedure-graph',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatChipsModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './polari-decision-procedure-graph.component.html',
  styleUrl: './polari-decision-procedure-graph.component.scss',
})
export class PolariDecisionProcedureGraphComponent implements OnInit {
  procedureName = '';
  procedure: ResolvedDecisionProcedure | null = null;
  treeRoots: ProcedureTreeNode[] = [];
  loading = false;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private polariScoring: PolariScoringService,
  ) {}

  ngOnInit(): void {
    this.procedureName = this.route.snapshot.paramMap.get('name') || '';
    if (!this.procedureName) {
      this.error = 'No decision procedure name in the route.';
      return;
    }
    this.load();
  }

  private load(): void {
    this.loading = true;
    this.error = null;
    this.polariScoring.getResolvedProcedure(this.procedureName).subscribe({
      next: (procedure) => {
        if (!procedure.ok) {
          this.error = procedure.error || 'Decision procedure unavailable.';
        } else {
          this.procedure = procedure;
          this.treeRoots = this.buildTree(procedure.forks, procedure.edges);
        }
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Could not reach Polari’s scoring engine — '
          + (err?.message || 'unknown error');
        this.loading = false;
      },
    });
  }

  /** Walks the edge list from every true-start edge (fromFork AND
   *  fromOutcome both null) down to terminals, guarding against
   *  cycles since the edge graph is human-editable data, not a
   *  provably-acyclic structure. */
  private buildTree(
    forks: ResolvedDecisionFork[],
    edges: DecisionProcedureGraphEdge[],
  ): ProcedureTreeNode[] {
    const forksByName = new Map(forks.map(f => [f.fork, f]));
    const startEdges = edges.filter(e => e.fromFork === null && e.fromOutcome === null);
    return startEdges.map(e => this.buildTargetNode(e, forksByName, edges, new Set()));
  }

  private buildTargetNode(
    edge: DecisionProcedureGraphEdge,
    forksByName: Map<string, ResolvedDecisionFork>,
    edges: DecisionProcedureGraphEdge[],
    path: Set<string>,
  ): ProcedureTreeNode {
    if (edge.toFork) {
      const forkName = edge.toFork;
      const fork = forksByName.get(forkName);
      const node: ProcedureTreeNode = {
        key: `fork:${forkName}`,
        kind: 'fork',
        label: forkName,
        outcome: edge.fromOutcome,
        edgeDescription: edge.description,
        fork,
        children: [],
      };
      if (path.has(forkName)) {
        return node;
      }
      const nextPath = new Set(path);
      nextPath.add(forkName);
      const outgoing = edges.filter(e => e.fromFork === forkName);
      node.children = outgoing.map(e => this.buildTargetNode(e, forksByName, edges, nextPath));
      return node;
    }
    return {
      key: `terminal:${edge.toTerminal}:${edge.description}`,
      kind: 'terminal',
      label: edge.toTerminal || 'unknown terminal',
      outcome: edge.fromOutcome,
      edgeDescription: edge.description,
      children: [],
    };
  }

  isResolvedByVote(criterionName: string, fork?: ResolvedDecisionFork): boolean {
    return !!fork && fork.resolvedSource === 'vote' && fork.resolvedCriterion === criterionName;
  }

  isIncumbentDefault(criterionName: string, fork?: ResolvedDecisionFork): boolean {
    return !!fork && fork.resolvedSource === 'incumbent-default' && fork.resolvedCriterion === criterionName;
  }
}
