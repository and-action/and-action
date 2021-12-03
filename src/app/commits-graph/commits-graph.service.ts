import { Injectable } from '@angular/core';
import {
  Commit,
  CommitWithIndentationLevel,
} from '../commits-dashboard/commits-dashboard-models';
import * as d3Selection from 'd3-selection';
import * as d3Path from 'd3-path';

const BRANCH_WIDTH = 20;
const COMMIT_HEIGHT = 80;
const COMMIT_CIRCLE_RADIUS = 4;
const BEZIER_CURVE_STRETCH_VALUE = 40;

@Injectable({
  providedIn: 'root',
})
export class CommitsGraphService {
  private static setIndentationLevelForCommits(
    commits: Commit[]
  ): CommitWithIndentationLevel[] {
    const commitIndentationLevel: {
      [commitOid: string]: number;
    } = {};

    const getCommitByOid = (oid: string) =>
      commits.find((commit) => commit.oid === oid);

    const getCommitIndexByOid = (oid: string) =>
      commits.indexOf(getCommitByOid(oid));

    const occupiedIndentationLevelsForCommitIndex = commits.map(() => []);

    const commitQueue = [{ oid: commits[0].oid, childOid: undefined }];
    while (commitQueue.length > 0) {
      const current = commitQueue.shift();
      const commit = getCommitByOid(current.oid);
      if (commit) {
        processCommit(
          commit,
          current.childOid ? getCommitByOid(current.childOid) : undefined
        );
        pushBranchCommitsToQueue(commit);
      }
    }

    return commits.map((commit) => ({
      ...commit,
      indentationLevel: commitIndentationLevel[commit.oid],
    }));

    function processCommit(commit: Commit, childCommit?: Commit) {
      if (!commitIndentationLevel[commit.oid]) {
        const lastCommitIndex = getCommitIndexByOid(commit.oid);
        const level = getMinFreeIndentationLevel(
          occupiedIndentationLevelsForCommitIndex[lastCommitIndex]
        );

        function getMinFreeIndentationLevel(occupiedLevels: number[]) {
          let i = 0;
          while (true) {
            if (!occupiedLevels.includes(i)) {
              return i;
            }
            ++i;
          }
        }

        const lastCommitIndexRelevantForLevel = childCommit
          ? getCommitIndexByOid(childCommit.oid) + 1
          : lastCommitIndex;
        while (commit) {
          commitIndentationLevel[commit.oid] = level;

          if (commitIndentationLevel[commit.parents[0]] < level) {
            commit = commits[getCommitIndexByOid(commit.parents[0]) - 1];
            break;
          }

          if (!getCommitByOid(commit.parents[0])) {
            commit = commits[commits.length - 1];
            break;
          }

          if (commit.parents.length <= 0) {
            break;
          }
          commit = getCommitByOid(commit.parents[0]);
        }

        const firstCommitIndex = getCommitIndexByOid(commit.oid);

        for (
          let i = lastCommitIndexRelevantForLevel;
          i <= firstCommitIndex;
          ++i
        ) {
          occupiedIndentationLevelsForCommitIndex[i].push(level);
        }
      }
    }

    function pushBranchCommitsToQueue(commit: Commit) {
      while (commit) {
        if (commit.parents.length > 1) {
          const [, ...rest] = commit.parents;
          for (const c of rest) {
            if (commitIndentationLevel[c] === undefined) {
              commitQueue.push({ oid: c, childOid: commit.oid });
            }
          }
        }

        if (
          commit.parents.length <= 0 ||
          commitIndentationLevel[commit.parents[0]] <
            commitIndentationLevel[commit.oid] ||
          !getCommitByOid(commit.parents[0])
        ) {
          break;
        }

        commit = getCommitByOid(commit.parents[0]);
      }
    }
  }
  private static createSvg(commits: CommitWithIndentationLevel[]) {
    return d3Selection
      .create('svg')
      .attr('viewbox', '0 0 300 1800')
      .attr(
        'width',
        (Math.max(...commits.map((commit) => commit.indentationLevel)) + 1) *
          BRANCH_WIDTH
      )
      .attr('height', commits.length * COMMIT_HEIGHT);
  }

  private static drawCommitNodes(
    svg: d3Selection.Selection<SVGSVGElement, undefined, null, undefined>,
    commits: CommitWithIndentationLevel[]
  ) {
    commits.forEach((commit, index) => {
      svg
        .append('circle')
        .attr('cx', commit.indentationLevel * BRANCH_WIDTH + BRANCH_WIDTH / 2)
        .attr('cy', index * COMMIT_HEIGHT + COMMIT_HEIGHT / 2)
        .attr('r', COMMIT_CIRCLE_RADIUS)
        .style('fill', 'gray');
    });
  }

  private static drawBranchEdges(
    svg: d3Selection.Selection<SVGSVGElement, undefined, null, undefined>,
    commits: CommitWithIndentationLevel[]
  ) {
    this.drawBranch(commits, undefined, commits[0], svg);
  }

  private static drawBranch(
    commits: CommitWithIndentationLevel[],
    mergeCommit: CommitWithIndentationLevel | undefined,
    latestBranchCommit: CommitWithIndentationLevel,
    svg: d3Selection.Selection<SVGSVGElement, undefined, null, undefined>
  ) {
    const getCommitByOid = (oid: string) =>
      commits.find((commit) => commit.oid === oid);

    const getCommitIndexByOid = (oid: string) =>
      commits.indexOf(getCommitByOid(oid));

    const branchLevel = latestBranchCommit.indentationLevel;

    let firstBranchCommit = latestBranchCommit;

    while (firstBranchCommit.parents[0]) {
      if (firstBranchCommit.parents.length > 1) {
        for (let i = 1; i < firstBranchCommit.parents.length; ++i) {
          const parentCommit = getCommitByOid(firstBranchCommit.parents[i]);
          if (parentCommit) {
            this.drawBranch(commits, firstBranchCommit, parentCommit, svg);
          }
        }
      }

      const firstParentCommit = getCommitByOid(firstBranchCommit.parents[0]);

      if (
        !firstParentCommit ||
        firstParentCommit.indentationLevel < branchLevel
      ) {
        break;
      }

      firstBranchCommit = getCommitByOid(firstBranchCommit.parents[0]);
    }

    const latestBranchCommitPoint = {
      x: branchLevel * BRANCH_WIDTH + BRANCH_WIDTH / 2,
      y:
        getCommitIndexByOid(latestBranchCommit.oid) * COMMIT_HEIGHT +
        COMMIT_HEIGHT / 2,
    };
    const firstBranchCommitPoint = {
      x: branchLevel * BRANCH_WIDTH + BRANCH_WIDTH / 2,
      y:
        getCommitIndexByOid(firstBranchCommit.oid) * COMMIT_HEIGHT +
        COMMIT_HEIGHT / 2,
    };

    const p = d3Path.path();
    if (mergeCommit) {
      p.moveTo(
        mergeCommit.indentationLevel * BRANCH_WIDTH + BRANCH_WIDTH / 2,
        getCommitIndexByOid(mergeCommit.oid) * COMMIT_HEIGHT + COMMIT_HEIGHT / 2
      );
      p.bezierCurveTo(
        mergeCommit.indentationLevel * BRANCH_WIDTH + BRANCH_WIDTH / 2,
        getCommitIndexByOid(mergeCommit.oid) * COMMIT_HEIGHT +
          COMMIT_HEIGHT / 2 +
          BEZIER_CURVE_STRETCH_VALUE,
        latestBranchCommitPoint.x,
        (getCommitIndexByOid(mergeCommit.oid) + 1) * COMMIT_HEIGHT +
          COMMIT_HEIGHT / 2 -
          BEZIER_CURVE_STRETCH_VALUE,
        latestBranchCommitPoint.x,
        (getCommitIndexByOid(mergeCommit.oid) + 1) * COMMIT_HEIGHT +
          COMMIT_HEIGHT / 2
      );
    } else {
      p.moveTo(latestBranchCommitPoint.x, latestBranchCommitPoint.y);
    }

    if (firstBranchCommit.parents[0]) {
      if (getCommitByOid(firstBranchCommit.parents[0])) {
        const parentCommit = getCommitByOid(firstBranchCommit.parents[0]);

        const parentCommitPoint = {
          x: parentCommit.indentationLevel * BRANCH_WIDTH + BRANCH_WIDTH / 2,
          y:
            getCommitIndexByOid(parentCommit.oid) * COMMIT_HEIGHT +
            COMMIT_HEIGHT / 2,
        };

        p.lineTo(firstBranchCommitPoint.x, parentCommitPoint.y - COMMIT_HEIGHT);

        p.bezierCurveTo(
          firstBranchCommitPoint.x,
          parentCommitPoint.y - COMMIT_HEIGHT + BEZIER_CURVE_STRETCH_VALUE,
          parentCommitPoint.x,
          parentCommitPoint.y - BEZIER_CURVE_STRETCH_VALUE,
          parentCommitPoint.x,
          parentCommitPoint.y
        );
      } else {
        // Draw branch edges to the end of chart since parent commits are below.
        p.lineTo(firstBranchCommitPoint.x, commits.length * COMMIT_HEIGHT);
      }
    } else {
      p.lineTo(firstBranchCommitPoint.x, firstBranchCommitPoint.y);
    }

    svg
      .append('path')
      // @ts-ignore
      .attr('d', p)
      .style('stroke', 'gray')
      .style('fill', 'transparent')
      .style('stroke-width', 2);
  }

  createCommitsGraphSvg(commits: Commit[]) {
    const commitsWithIndentationLevel =
      CommitsGraphService.setIndentationLevelForCommits(commits);

    const svg = CommitsGraphService.createSvg(commitsWithIndentationLevel);
    CommitsGraphService.drawCommitNodes(svg, commitsWithIndentationLevel);
    CommitsGraphService.drawBranchEdges(svg, commitsWithIndentationLevel);

    return svg;
  }
}