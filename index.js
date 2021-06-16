const parse = require('csv-parse/lib/sync');
const fs = require('fs');
const childProcess = require('child_process');

const GH_EXECUTABLE = '/usr/local/bin/gh';

const CSV_PARSE_OPTIONS = {
  columns: true,
  skip_empty_lines: true,
};

function submitGHIssue(student) {
  console.log('submitting', student);

  const markText = `\n\nMark: ${student.mark}`;
  const issueText = student.feedback + markText;

  const result = childProcess.spawnSync(
    GH_EXECUTABLE,
    [
      'issue',
      'create',
      '-b',
      issueText,
      '-t',
      'mark and feedback',
    ],
    {
      cwd: student.repo,
    },
  );

  console.log(result);
  if (result.status !== 0) {
    process.exit(result.status);
  }
}

function main(fileName) {
  const file = fs.readFileSync(fileName);
  const data = parse(file, CSV_PARSE_OPTIONS);

  for (const student of data) {
    try {
      if (!student.repo) continue;

      const dirStat = fs.statSync(student.repo);
      if (!dirStat.isDirectory()) {
        console.error('repo not a directory', student);
        continue;
      }

      submitGHIssue(student);
    } catch (e) {
      console.error('problem', e, student);
      continue;
    }
  }
}

main(process.argv[2]);
