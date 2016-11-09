module.exports = (o) => {
  const tbname  =     o.name
  const allTb   =     tbname + '_alltbs'
  const countTb =     tbname + '_email_count'
  const siteCountTb = tbname + '_site_count'
  const groupCount  = o.groupCount || 300 //通过email的分类给邮件分组 但取决于出现的次数
  let siteAnalyze; 
  if (o.groupBySite){
    siteAnalyze = `--邮件分类分析
DROP TABLE IF EXISTS analysis.${siteCountTb};
CREATE TABLE analysis.${siteCountTb} AS (
SELECT 
(
  regexp_split_to_array("email", '@'))['2'] as site, 
  sum(from_count + to_count) AS "count", 
  sum(from_count) AS "from_count",
  sum(to_count) AS "to_count"
  FROM analysis.${countTb}
  WHERE from_count != 0 --排除邮件组和备份邮件
  AND to_count != 0
  GROUP BY (regexp_split_to_array("email", '@'))['2']
  ORDER BY count DESC
);

UPDATE analysis.${countTb}
SET site = tb.site
FROM analysis.${siteCountTb} AS tb
WHERE email LIKE ('%@' || tb.site)
AND tb.count > ${groupCount};`
  } else {
    siteAnalyze = ''
  }

  return `
--建立一个专门用来分析的 schema
CREATE SCHEMA IF NOT EXISTS analysis;

--建立所有的邮件表
DROP TABLE IF EXISTS analysis.${allTb};
CREATE TABLE analysis.${allTb} AS (
  SELECT "from", unnest("to") AS "to", "content" 
  FROM podestas
);

--建立email计数表
DROP TABLE IF EXISTS analysis.${countTb};
CREATE TABLE analysis.${countTb} AS (
  SELECT count(1) AS from_count, "from" AS email, 0 AS to_count,  null as site
  FROM analysis.${allTb}
  WHERE char_length("from") < 35
  GROUP BY "from"
);

alter table analysis.${countTb}
alter column site type CHARACTER(255);

ALTER TABLE analysis.${countTb} ADD UNIQUE(email);

WITH tbs AS (
  SELECT count(1) AS to_count, "to" AS email, 0 AS from_count
  FROM analysis.${allTb}
  WHERE char_length("to") < 35
  GROUP BY "to"
)

INSERT INTO analysis.${countTb}(email, from_count, to_count)
SELECT email, from_count, to_count 
FROM tbs
ON CONFLICT(email) DO UPDATE
SET to_count = excluded.to_count;

${siteAnalyze}
`
}