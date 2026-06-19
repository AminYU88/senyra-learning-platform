# Dataset Documentation

## UCI Student Performance Dataset

- Source: UCI Machine Learning Repository, Student Performance dataset.
- Official page: https://archive.ics.uci.edu/dataset/320/student+performance
- Purpose: pass/fail prediction, grade prediction and student risk prediction.
- Features used: school, age, study time, failures, absences, support variables, family/social variables, G1, G2.
- Target variable: `G3` final grade. Senyra derives pass/fail and risk labels from final grade bands.
- Ethical limitations: demographic and social variables can encode bias. Predictions must support intervention, not punishment.

## xAPI-Edu-Data Dataset

- Source: commonly distributed through Kaggle as Students' Academic Performance / xAPI-Edu-Data.
- Purpose: engagement prediction, participation analysis and dropout risk.
- Features used: raised hands, visited resources, announcements viewed, discussion, absence days and parent/survey indicators.
- Target variable: engagement/class level.
- Ethical limitations: the official Kaggle source requires credentials, so Senyra includes a documented local teaching sample unless the user downloads the official CSV manually.

## Mathematics Question/Topic Dataset

- Source: locally curated Senyra UK curriculum teaching dataset.
- Purpose: maths quiz generation, weak topic detection and revision recommendations.
- Features used: curriculum level, topic, question, answer and worked solution.
- Target variable: topic/skill area for recommendation and weak-topic matching.
- Ethical limitations: generated/local questions should be teacher-reviewed before high-stakes assessment use.

## English Language/Literature Content Dataset

- Source: locally curated Senyra UK curriculum teaching dataset.
- Purpose: reading comprehension, essay practice, literature questions and revision support.
- Features used: subject, topic, task and assessed skills.
- Target variable: topic/skill area for recommendation and weak-topic matching.
- Ethical limitations: model answers and practice prompts should support learning and not replace teacher judgement.

## Senyra Internal Learning Data

- Source: Senyra application data and synthetic starter analytics CSV.
- Purpose: quiz scores, learning events, completed activities, login/engagement proxy, time spent proxy and weak-topic detection.
- Features used: attendance, engagement, quiz score, assignment score, lesson completion, study hours, late submissions, forum posts, practice completions and previous failures.
- Target variable: risk level, pass/fail, engagement level and weak topic.
- Ethical limitations: behavioural data can be incomplete. Use predictions as decision support only.
