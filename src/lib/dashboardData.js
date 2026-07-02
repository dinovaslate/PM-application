export const MONTHS = [
  { key: "jan", label: "Jan", index: 0 },
  { key: "feb", label: "Feb", index: 1 },
  { key: "mar", label: "Mar", index: 2 },
  { key: "apr", label: "Apr", index: 3 },
  { key: "may", label: "Mei", index: 4 },
  { key: "jun", label: "Jun", index: 5 },
  { key: "jul", label: "Jul", index: 6 },
  { key: "aug", label: "Agu", index: 7 },
  { key: "sep", label: "Sep", index: 8 },
  { key: "oct", label: "Okt", index: 9 },
  { key: "nov", label: "Nov", index: 10 },
  { key: "dec", label: "Des", index: 11 },
];

const FIELD_ALIASES = {
  iwo: ["iwo", "iwono", "workorder", "internalworkorder", "nomoriwo", "kodeiwo"],
  project: ["projectname", "namaproject", "namaproyek", "project", "proyek"],
  customer: ["endcustname", "endcustomer", "customername", "custname", "customer", "client", "pelanggan", "namacustomer"],
  pm: ["pm", "pmname", "namapm", "projectmanager", "managerproject", "projectlead", "pic"],
  bu: ["bualias", "buname", "bu", "businessunit", "unitbisnis", "division", "divisi"],
  startDate: ["startdate", "projectstart", "mulai", "tanggalmulai", "start"],
  endDate: ["enddate", "finishdate", "duedate", "targetdate", "tanggalakhir", "deadline"],
  health: ["overallhealthcat", "projecthealthcat", "healthcat", "overallhealth", "health", "projecthealth", "statushealth", "kesehatanproyek"],
  dueStatus: ["duestatus", "due", "deadline", "statusdue", "overdue"],
  schedule: ["spi", "schedulecat", "scheduleperformancecat", "scheduleperformance", "statusschedule", "schedulestatus", "jadwal", "schedule"],
  resource: [
    "mandaysinfo",
    "planvsprecalc",
    "resourcecat",
    "resourcecondition",
    "resourceutilization",
    "resourceutilisation",
    "kondisiresource",
    "resource",
  ],
  cost: ["budgetstatus", "costcat", "costcondition", "statuscost", "budgetcondition", "kondisicost", "kondisibiaya", "costscore"],
  costAmount: [
    "totalcostactualperiwo",
    "costactualperiwo",
    "mandayschargedamount",
    "allocatedmandaysamount",
    "mandaysworkplanamount",
    "costplanperiwo",
    "actualcostperiwo",
    "plannedcostperiwo",
    "costactual",
    "costplan",
    "actualcost",
    "plannedcost",
    "costamount",
    "projectcost",
    "budgetamount",
    "estimatedcost",
    "nilaicost",
    "nilaibiaya",
    "cost",
    "budget",
    "biaya",
  ],
  openIssue: ["openissue", "openissues", "issuecount", "jumlahissue", "jumlahopenissue", "prjissuestatus", "projectissuestatus", "issuestatus"],
  issueType: ["issuetype", "prjissuedesc", "projectissuedesc", "issuedesc", "jenismasalah", "jenisissue", "kategoriissue", "problemtype"],
  value: ["amountidr", "contractamount", "amount", "value", "projectvalue", "nilaiproject", "nilaiproyek", "contractvalue", "nilai"],
  pmWorkload: ["pmworkload", "workload", "bebankerjapm", "capacity", "utilization", "utilisation"],
};

const AGGREGATE_COST_ACTUAL_ALIASES = [
  "totalcostactualperiwo",
  "costactualperiwo",
  "actualcostperiwo",
  "mandayschargedamount",
  "allocatedmandaysamount",
  "mandaysworkplanamount",
  "costactual",
  "actualcost",
  "costamount",
  "projectcost",
  "ac",
];

const DETAIL_COST_ACTUAL_ALIASES = [
  "directcostactualperiwo",
  "indirectcostactualperiwo",
  "assetactualperiwo",
];

const COST_PLAN_ALIASES = [
  "totalcostplanperiwo",
  "costplanperiwo",
  "plannedcostperiwo",
  "directcostplanperiwo",
  "indirectcostplanperiwo",
  "assetplanperiwo",
  "costplan",
  "plannedcost",
  "budgetamount",
  "budget",
];

const DASHBOARD_YEAR = new Date().getFullYear();

const MONTH_ALIASES = {
  jan: ["jan", "january", "januari", "workloadjan", "workloadjanuari", "janworkload"],
  feb: ["feb", "february", "februari", "workloadfeb", "workloadfebruari", "febworkload"],
  mar: ["mar", "march", "maret", "workloadmar", "workloadmaret", "marworkload"],
  apr: ["apr", "april", "workloadapr", "workloadapril", "aprworkload"],
  may: ["may", "mei", "workloadmay", "workloadmei", "mayworkload"],
  jun: ["jun", "june", "juni", "workloadjun", "workloadjuni", "junworkload"],
  jul: ["jul", "july", "juli", "workloadjul", "workloadjuli", "julworkload"],
  aug: ["aug", "august", "agu", "agustus", "workloadaug", "workloadagustus", "aguworkload"],
  sep: ["sep", "september", "workloadsep", "workloadseptember", "sepworkload"],
  oct: ["oct", "okt", "october", "oktober", "workloadoct", "workloadoktober", "oktworkload"],
  nov: ["nov", "november", "workloadnov", "workloadnovember", "novworkload"],
  dec: ["dec", "des", "december", "desember", "workloaddec", "workloaddesember", "desworkload"],
};

const MONTH_COST_ALIASES = {
  jan: ["costjan", "biayajan", "budgetjan", "costjanuari", "biayajanuari"],
  feb: ["costfeb", "biayafeb", "budgetfeb", "costfebruari", "biayafebruari"],
  mar: ["costmar", "biayamar", "budgetmar", "costmaret", "biayamaret"],
  apr: ["costapr", "biayaapr", "budgetapr", "costapril", "biayaapril"],
  may: ["costmay", "biayamay", "budgetmay", "costmei", "biayamei"],
  jun: ["costjun", "biayajun", "budgetjun", "costjuni", "biayajuni"],
  jul: ["costjul", "biayajul", "budgetjul", "costjuli", "biayajuli"],
  aug: ["costaug", "biayaaug", "budgetaug", "costagu", "biayaagu", "costagustus", "biayaagustus"],
  sep: ["costsep", "biayasep", "budgetsep", "costseptember", "biayaseptember"],
  oct: ["costoct", "biayaoct", "budgetoct", "costokt", "biayaokt", "costoktober", "biayaoktober"],
  nov: ["costnov", "biayanov", "budgetnov", "costnovember", "biayanovember"],
  dec: ["costdec", "biayadec", "budgetdec", "costdes", "biayades", "costdesember", "biayadesember"],
};

export const sampleProjects = [
  {
    iwo: "IWO-24011",
    project: "Core Banking Integration",
    customer: "Bank Nusantara",
    pm: "Alya Pratama",
    bu: "Financial Services",
    health: "Need Improvement",
    dueStatus: "Overdue",
    schedule: "Delay",
    resource: "Overutilized",
    cost: "At Risk",
    openIssue: 7,
    issueType: "Resource",
    value: 14500000000,
    costAmount: 9800000000,
    workload: { jun: 0.95, jul: 1.15, aug: 1.34, sep: 1.42, oct: 1.31, nov: 1.18, dec: 1.08 },
  },
  {
    iwo: "IWO-24018",
    project: "ERP Finance Rollout",
    customer: "Kencana Retail",
    pm: "Raka Wijaya",
    bu: "Enterprise",
    health: "Warning",
    dueStatus: "Overdue",
    schedule: "Delay",
    resource: "Normal",
    cost: "On Budget",
    openIssue: 5,
    issueType: "Scope",
    value: 9800000000,
    costAmount: 7600000000,
    workload: { jun: 0.84, jul: 1.02, aug: 1.12, sep: 1.26, oct: 1.19, nov: 1.06, dec: 0.96 },
  },
  {
    iwo: "IWO-24025",
    project: "Data Lake Modernization",
    customer: "Telco Prima",
    pm: "Alya Pratama",
    bu: "Technology",
    health: "Warning",
    dueStatus: "At Risk",
    schedule: "Potential Delay",
    resource: "Overutilized",
    cost: "At Risk",
    openIssue: 3,
    issueType: "Vendor",
    value: 12600000000,
    costAmount: 9100000000,
    workload: { jun: 0.7, jul: 0.88, aug: 1.05, sep: 1.18, oct: 1.22, nov: 1.28, dec: 1.17 },
  },
  {
    iwo: "IWO-24029",
    project: "Dealer Portal Revamp",
    customer: "Astra Digital",
    pm: "Sinta Lestari",
    bu: "Digital",
    health: "Healthy",
    dueStatus: "On Track",
    schedule: "On Time",
    resource: "Normal",
    cost: "On Budget",
    openIssue: 0,
    issueType: "None",
    value: 4300000000,
    costAmount: 2800000000,
    workload: { jun: 0.52, jul: 0.64, aug: 0.71, sep: 0.73, oct: 0.69, nov: 0.62, dec: 0.58 },
  },
  {
    iwo: "IWO-24034",
    project: "Claims Automation",
    customer: "Sehat Insurance",
    pm: "Bima Santoso",
    bu: "Financial Services",
    health: "Warning",
    dueStatus: "Overdue",
    schedule: "Potential Delay",
    resource: "Underutilized",
    cost: "Over Budget",
    openIssue: 4,
    issueType: "Cost",
    value: 7200000000,
    costAmount: 5200000000,
    workload: { jun: 0.61, jul: 0.78, aug: 0.86, sep: 0.9, oct: 0.94, nov: 0.99, dec: 1.03 },
  },
  {
    iwo: "IWO-24041",
    project: "Customer 360 Platform",
    customer: "Mitra Commerce",
    pm: "Raka Wijaya",
    bu: "Digital",
    health: "Need Improvement",
    dueStatus: "Overdue",
    schedule: "Delay",
    resource: "Overutilized",
    cost: "At Risk",
    openIssue: 8,
    issueType: "Integration",
    value: 11200000000,
    costAmount: 8400000000,
    workload: { jun: 0.82, jul: 0.98, aug: 1.16, sep: 1.29, oct: 1.36, nov: 1.31, dec: 1.18 },
  },
  {
    iwo: "IWO-24046",
    project: "Manufacturing MES Upgrade",
    customer: "Surya Manufacturing",
    pm: "Dewi Anjani",
    bu: "Industrial",
    health: "Healthy",
    dueStatus: "On Track",
    schedule: "Leading",
    resource: "Normal",
    cost: "On Budget",
    openIssue: 1,
    issueType: "Change Request",
    value: 6800000000,
    costAmount: 4100000000,
    workload: { jun: 0.44, jul: 0.55, aug: 0.68, sep: 0.72, oct: 0.76, nov: 0.7, dec: 0.65 },
  },
  {
    iwo: "IWO-24053",
    project: "HRIS Consolidation",
    customer: "Global Talent Group",
    pm: "Sinta Lestari",
    bu: "Enterprise",
    health: "Healthy",
    dueStatus: "On Track",
    schedule: "On Time",
    resource: "Normal",
    cost: "On Budget",
    openIssue: 0,
    issueType: "None",
    value: 3600000000,
    costAmount: 2300000000,
    workload: { jun: 0.38, jul: 0.46, aug: 0.52, sep: 0.58, oct: 0.57, nov: 0.51, dec: 0.48 },
  },
  {
    iwo: "IWO-24057",
    project: "Payment Gateway Expansion",
    customer: "Paylink Indonesia",
    pm: "Bima Santoso",
    bu: "Technology",
    health: "Warning",
    dueStatus: "At Risk",
    schedule: "Potential Delay",
    resource: "Normal",
    cost: "At Risk",
    openIssue: 2,
    issueType: "Compliance",
    value: 8900000000,
    costAmount: 6200000000,
    workload: { jun: 0.72, jul: 0.84, aug: 0.96, sep: 1.04, oct: 1.12, nov: 1.18, dec: 1.09 },
  },
  {
    iwo: "IWO-24062",
    project: "Warehouse Mobility",
    customer: "Logistik Raya",
    pm: "Dewi Anjani",
    bu: "Industrial",
    health: "Healthy",
    dueStatus: "On Track",
    schedule: "On Time",
    resource: "Normal",
    cost: "On Budget",
    openIssue: 0,
    issueType: "None",
    value: 5200000000,
    costAmount: 3400000000,
    workload: { jun: 0.5, jul: 0.6, aug: 0.72, sep: 0.76, oct: 0.8, nov: 0.74, dec: 0.68 },
  },
  {
    iwo: "IWO-24067",
    project: "Treasury Risk Engine",
    customer: "Bank Nusantara",
    pm: "Alya Pratama",
    bu: "Financial Services",
    health: "Need Improvement",
    dueStatus: "At Risk",
    schedule: "Delay",
    resource: "Overutilized",
    cost: "Over Budget",
    openIssue: 6,
    issueType: "Technical",
    value: 15600000000,
    costAmount: 11800000000,
    workload: { jun: 0.78, jul: 0.94, aug: 1.1, sep: 1.25, oct: 1.37, nov: 1.43, dec: 1.33 },
  },
  {
    iwo: "IWO-24072",
    project: "Branch Network Refresh",
    customer: "Bank Sentosa",
    pm: "Raka Wijaya",
    bu: "Technology",
    health: "Healthy",
    dueStatus: "On Track",
    schedule: "On Time",
    resource: "Normal",
    cost: "On Budget",
    openIssue: 1,
    issueType: "Vendor",
    value: 6100000000,
    costAmount: 3900000000,
    workload: { jun: 0.64, jul: 0.72, aug: 0.8, sep: 0.83, oct: 0.78, nov: 0.73, dec: 0.69 },
  },
];

export const defaultRules = {
  criticalWorkload: 1.2,
  overloadedWorkload: 1.0,
  underutilizedWorkload: 0.6,
  highIssueCount: 1,
};

export function parseWorkbook(file) {
  return import("read-excel-file/browser").then(({ default: readXlsxFile }) =>
    readXlsxFile(file).then((result) => parseWorkbookData(result)),
  );
}

export async function parseWorkbooks(files) {
  const fileList = Array.from(files || []);
  const parsedFiles = await Promise.all(
    fileList.map(async (file) => {
      const rows = await parseWorkbook(file);
      return rows.map((project) => ({
        ...project,
        sourceFile: file.name || "Excel file",
      }));
    }),
  );

  return mergeProjectRecords(parsedFiles.flat());
}

export function parseWorkbookData(result) {
  const sheets = normalizeWorkbookResult(result);
  const parsedSheets = sheets
    .map((sheet) => parseSheetRows(sheet.data || []))
    .filter((rows) => rows.length > 0)
    .sort((a, b) => b.length - a.length);

  return (parsedSheets[0] || [])
    .filter(hasMeaningfulRawRow)
    .map((row, index) => normalizeProject(row, index));
}

function normalizeWorkbookResult(result) {
  if (!Array.isArray(result)) return [];
  if (result[0] && typeof result[0] === "object" && "data" in result[0]) {
    return result;
  }
  return [{ sheet: "Sheet 1", data: result }];
}

function parseSheetRows(rows) {
  const nonEmptyRows = rows.filter((row) => !isEmptyRow(row));
  if (!nonEmptyRows.length) return [];

  const headerIndex = findHeaderRowIndex(nonEmptyRows);
  if (headerIndex < 0) return [];

  const headers = nonEmptyRows[headerIndex].map((header, index) => String(header || `Column ${index + 1}`));
  return nonEmptyRows
    .slice(headerIndex + 1)
    .map((cells) =>
      headers.reduce((row, header, index) => {
        row[header] = cells[index] ?? "";
        return row;
      }, {}),
    )
    .filter((row) => Object.values(row).some((value) => String(value ?? "").trim() !== ""));
}

function findHeaderRowIndex(rows) {
  const scoredRows = rows.slice(0, 25).map((row, index) => ({
    index,
    score: getHeaderScore(row),
  }));
  const best = scoredRows.sort((a, b) => b.score - a.score)[0];
  return best && best.score >= 2 ? best.index : -1;
}

function getHeaderScore(row) {
  return row.reduce((score, cell) => {
    const key = compactKey(cell);
    if (!key) return score;
    if (matchesAliases(key, FIELD_ALIASES.pm)) return score + 3;
    if (matchesAliases(key, FIELD_ALIASES.project) || matchesAliases(key, FIELD_ALIASES.iwo)) return score + 2;
    if (Object.values(FIELD_ALIASES).some((aliases) => matchesAliases(key, aliases))) return score + 1;
    if (Object.values(MONTH_ALIASES).some((aliases) => matchesAliases(key, aliases))) return score + 1;
    if (Object.values(MONTH_COST_ALIASES).some((aliases) => matchesAliases(key, aliases))) return score + 1;
    return score;
  }, 0);
}

function matchesAliases(key, aliases) {
  return aliases.some((alias) => key === alias || key.includes(alias));
}

function isEmptyRow(row) {
  return !row || row.every((value) => String(value ?? "").trim() === "");
}

function hasCellValue(value) {
  return value !== "" && value != null && String(value).trim() !== "";
}

function hasMeaningfulRawRow(row) {
  return Boolean(
    getField(row, "iwo") ||
      getField(row, "project") ||
      getField(row, "pm") ||
      getField(row, "customer") ||
      parsePlainNumber(getField(row, "value")) > 0 ||
      getCostAmount(row) > 0 ||
      parseOpenIssue(getField(row, "openIssue"), getField(row, "issueType")) > 0 ||
      MONTHS.some((month) => getMonthField(row, month.key) !== ""),
  );
}

export function buildDashboard(projects, rules = defaultRules) {
  const workloadMode = getWorkloadMode(projects);
  const enriched = projects.map((project, index) => {
    const shouldUseProxy = !projectHasUsableWorkload(project);
    const workload = shouldUseProxy ? getProxyWorkload(project) : project.workload;
    const projectWithWorkload = {
      ...project,
      id: project.id || project.iwo || `${project.pm || "pm"}-${project.project || "project"}-${index}`,
      workload,
      workloadSource: shouldUseProxy ? "proxy" : "live",
      hasScheduleInput: project.hasScheduleInput ?? hasCellValue(project.schedule),
      hasCostInput:
        project.hasCostInput ??
        (project.costAmount !== undefined && project.costAmount !== null && project.costAmount > 0),
      hasIssueInput:
        project.hasIssueInput ??
        ((project.openIssue !== undefined && project.openIssue !== null) || hasCellValue(project.issueType)),
    };
    const currentWorkload = getCurrentWorkload(projectWithWorkload);
    const priority = getPriority(projectWithWorkload, currentWorkload, rules);
    return { ...projectWithWorkload, currentWorkload, priority };
  });
  const dashboardMonths = getDashboardMonths(enriched);

  const totalValueAtRisk = enriched
    .filter((item) => item.health !== "Healthy" || item.dueStatus === "Overdue")
    .reduce((sum, item) => sum + item.value, 0);

  const pmMonthWorkloads = getPmMonthWorkloads(enriched);
  const overloadedPmNames = pmMonthWorkloads
    .filter((pm) => Math.max(...MONTHS.map((month) => pm[month.key] || 0)) > rules.overloadedWorkload)
    .map((pm) => pm.pm);

  return {
    months: dashboardMonths,
    dataQuality: {
      workloadMode,
      hasWorkloadInput: workloadMode === "live" || workloadMode === "mixed",
      scheduleInputCount: enriched.filter((item) => item.hasScheduleInput).length,
      issueInputCount: enriched.filter((item) => item.hasIssueInput).length,
      costInputCount: enriched.filter((item) => item.hasCostInput).length,
    },
    projects: enriched,
    kpis: {
      totalProjects: enriched.length,
      healthy: enriched.filter((item) => item.health === "Healthy").length,
      warning: enriched.filter((item) => item.health === "Warning").length,
      needImprovement: enriched.filter((item) => item.health === "Need Improvement").length,
      overdue: enriched.filter((item) => item.dueStatus === "Overdue").length,
      openIssueProjects: enriched.filter((item) => item.openIssue > 0).length,
      overloadedPms: overloadedPmNames.length,
      valueAtRisk: totalValueAtRisk,
    },
    charts: {
      healthDistribution: countBy(enriched, "health"),
      dueByBu: dueByBusinessUnit(enriched),
      pmWorkloadTrend: pmMonthWorkloads,
      pmCostTrend: getPmMonthCostTrend(enriched),
      pmPortfolioSummary: getPmPortfolioSummary(enriched),
      healthByBu: stackedBy(enriched, "bu", "health"),
      scheduleDistribution: countBy(enriched, "schedule"),
      resourceDistribution: countBy(enriched, "resource"),
      costDistribution: countBy(enriched, "cost"),
      issueByType: issueByType(enriched),
      projectCountByPm: countProjectsByPm(enriched),
      workloadByBu: workloadByBu(enriched),
      pmStatusDistribution: getPmStatusDistribution(pmMonthWorkloads, rules, dashboardMonths),
    },
    priorityProjects: [...enriched].sort(prioritySort).slice(0, 6),
    troubledHighValueProjects: [...enriched]
      .filter((item) => item.health !== "Healthy" || item.dueStatus === "Overdue" || item.openIssue > 0)
      .sort((a, b) => b.value - a.value)
      .slice(0, 6),
    overloadedPmNames,
    pmRiskList: getPmRiskList(enriched),
  };
}

function normalizeProject(row, index) {
  const workload = {};
  const pmWorkloadRaw = getField(row, "pmWorkload");
  const pmWorkload = parseWorkload(pmWorkloadRaw);
  const startDate = parseDateValue(getField(row, "startDate"));
  const endDate = parseDateValue(getField(row, "endDate"));
  const rawDueStatus = getField(row, "dueStatus");
  const rawSchedule = getField(row, "schedule");
  const rawOpenIssue = getField(row, "openIssue");
  const rawIssueType = getField(row, "issueType");
  const rawCostAmount = getCostAmount(row);
  const monthlyWorkloadValues = MONTHS.map((month) => ({
    month,
    raw: getMonthField(row, month.key),
  }));
  const hasAnyMonthlyWorkload = monthlyWorkloadValues.some(({ raw }) => raw !== "" && raw != null);
  const hasPmWorkload = pmWorkloadRaw !== "" && pmWorkloadRaw != null;
  const hasWorkloadInput = hasAnyMonthlyWorkload || hasPmWorkload;

  monthlyWorkloadValues.forEach(({ month, raw: value }) => {
    const hasExplicitValue = value !== "" && value != null;
    workload[month.key] = hasExplicitValue
      ? parseWorkload(value)
      : hasPmWorkload && isProjectActiveInMonth({ startDate, endDate }, month)
        ? pmWorkload
        : 0;
  });
  const hasUsableWorkloadInput = hasWorkloadInput && MONTHS.some((month) => (workload[month.key] || 0) > 0);

  const projectValue = Math.max(0, parsePlainNumber(getField(row, "value")) || 0);
  const costAmount = Math.max(0, rawCostAmount);
  const openIssue = parseOpenIssue(rawOpenIssue, rawIssueType);
  const hasCostInput = hasCostFields(row);
  const monthlyCost = {};
  MONTHS.forEach((month) => {
    const value = getMonthCostField(row, month.key);
    monthlyCost[month.key] = value === "" || value == null ? 0 : Math.max(0, parsePlainNumber(value));
  });

  return {
    id: getField(row, "iwo") || `ROW-${index + 1}`,
    iwo: String(getField(row, "iwo") || `IWO-${String(index + 1).padStart(4, "0")}`),
    project: String(getField(row, "project") || `Project ${index + 1}`),
    customer: String(getField(row, "customer") || "Unassigned"),
    pm: String(getField(row, "pm") || "Unassigned PM"),
    bu: String(getField(row, "bu") || "Unassigned BU"),
    startDate,
    endDate,
    health: normalizeHealth(getField(row, "health")),
    dueStatus: hasCellValue(rawDueStatus) ? normalizeDueStatus(rawDueStatus) : inferDueStatusFromEndDate(endDate),
    schedule: normalizeSchedule(rawSchedule),
    resource: normalizeResourceCondition(getField(row, "resource")),
    cost: normalizeCostCondition(getField(row, "cost")),
    openIssue,
    issueType: String(rawIssueType || "None"),
    value: projectValue,
    costAmount,
    monthlyCost,
    hasCostInput,
    hasScheduleInput: hasCellValue(rawSchedule),
    hasIssueInput: hasCellValue(rawOpenIssue) || hasIssueText(rawIssueType),
    hasWorkloadInput,
    hasUsableWorkloadInput,
    workload,
  };
}

function mergeProjectRecords(projects) {
  const merged = new Map();

  projects.forEach((project, index) => {
    const key = getProjectMergeKey(project, index);
    const current = merged.get(key);
    merged.set(key, current ? mergeProject(current, project) : project);
  });

  return Array.from(merged.values()).map((project, index) => ({
    ...project,
    id: project.iwo || project.id || `ROW-${index + 1}`,
  }));
}

function getProjectMergeKey(project, index) {
  const iwo = String(project.iwo || "").trim();
  if (iwo && !/^IWO-\d+$/i.test(iwo)) return `iwo:${compactKey(iwo)}`;

  const projectName = compactKey(project.project);
  const pm = compactKey(project.pm);
  const customer = compactKey(project.customer);
  if (projectName && pm) return `project:${projectName}:${pm}:${customer}`;
  return `row:${index}`;
}

function mergeProject(current, incoming) {
  const workload = {};
  MONTHS.forEach((month) => {
    workload[month.key] = Math.max(current.workload?.[month.key] || 0, incoming.workload?.[month.key] || 0);
  });

  const monthlyCost = {};
  MONTHS.forEach((month) => {
    monthlyCost[month.key] = Math.max(current.monthlyCost?.[month.key] || 0, incoming.monthlyCost?.[month.key] || 0);
  });

  return {
    ...current,
    project: chooseSpecificText(current.project, incoming.project, "Project"),
    customer: chooseSpecificText(current.customer, incoming.customer, "Unassigned"),
    pm: chooseSpecificText(current.pm, incoming.pm, "Unassigned"),
    bu: chooseSpecificText(current.bu, incoming.bu, "Unassigned"),
    sourceFile: mergeSourceFiles(current.sourceFile, incoming.sourceFile),
    startDate: earliestDate(current.startDate, incoming.startDate),
    endDate: latestDate(current.endDate, incoming.endDate),
    health: pickBySeverity(current.health, incoming.health, { Healthy: 0, Warning: 1, "Need Improvement": 2 }),
    dueStatus: pickBySeverity(current.dueStatus, incoming.dueStatus, { "On Track": 0, "At Risk": 1, Overdue: 2 }),
    schedule: pickBySeverity(current.schedule, incoming.schedule, { Leading: 0, "On Time": 1, "Potential Delay": 2, Delay: 3 }),
    resource: pickCondition(current.resource, incoming.resource),
    cost: pickCondition(current.cost, incoming.cost),
    openIssue: Math.max(current.openIssue || 0, incoming.openIssue || 0),
    issueType: chooseIssueType(current.issueType, incoming.issueType),
    value: Math.max(current.value || 0, incoming.value || 0),
    costAmount: Math.max(current.costAmount || 0, incoming.costAmount || 0),
    monthlyCost,
    hasCostInput: current.hasCostInput || incoming.hasCostInput,
    hasScheduleInput: current.hasScheduleInput || incoming.hasScheduleInput,
    hasIssueInput: current.hasIssueInput || incoming.hasIssueInput,
    hasWorkloadInput: current.hasWorkloadInput || incoming.hasWorkloadInput,
    hasUsableWorkloadInput: current.hasUsableWorkloadInput || incoming.hasUsableWorkloadInput,
    workload,
  };
}

function chooseSpecificText(current, incoming, placeholder) {
  const currentText = String(current || "").trim();
  const incomingText = String(incoming || "").trim();
  if (!currentText || compactKey(currentText).startsWith(compactKey(placeholder))) return incomingText || currentText;
  if (incomingText.length > currentText.length && !compactKey(incomingText).startsWith(compactKey(placeholder))) return incomingText;
  return currentText;
}

function mergeSourceFiles(current, incoming) {
  return Array.from(
    new Set(
      [current, incoming]
        .flatMap((item) => String(item || "").split(","))
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  ).join(", ");
}

function earliestDate(a, b) {
  if (!a) return b || null;
  if (!b) return a;
  return a <= b ? a : b;
}

function latestDate(a, b) {
  if (!a) return b || null;
  if (!b) return a;
  return a >= b ? a : b;
}

function pickBySeverity(current, incoming, severityMap) {
  const currentSeverity = severityMap[current] ?? 0;
  const incomingSeverity = severityMap[incoming] ?? 0;
  return incomingSeverity > currentSeverity ? incoming : current;
}

function pickCondition(current, incoming) {
  const severity = {
    overbudget: 4,
    shortage: 4,
    minus: 4,
    risk: 3,
    alert: 3,
    workplan20: 3,
    workplangreater20: 3,
    workplangreater020: 2,
    onbudget: 1,
    oncontrol: 1,
    surplus: 0,
    normal: 0,
  };
  const score = (value) => {
    const key = compactKey(value);
    return Object.entries(severity).reduce((max, [needle, itemScore]) => (key.includes(needle) ? Math.max(max, itemScore) : max), 0);
  };
  return score(incoming) > score(current) ? incoming : current;
}

function chooseIssueType(current, incoming) {
  if (hasIssueText(incoming) && !["none", "na"].includes(compactKey(incoming))) return String(incoming);
  return String(current || "None");
}

function getField(row, field) {
  const normalizedMap = Object.entries(row).map(([key, value]) => [compactKey(key), value]);
  const aliases = FIELD_ALIASES[field] || [];
  if (field === "costAmount" || field === "value") {
    const prioritized = getPrioritizedNumericField(normalizedMap, aliases);
    if (prioritized !== "") return prioritized;
  }
  const exact = findFieldByAliasPriority(normalizedMap, aliases, false);
  if (exact) return exact[1];
  const partial = findFieldByAliasPriority(normalizedMap, aliases, true);
  return partial ? partial[1] : "";
}

function getPrioritizedNumericField(normalizedMap, aliases) {
  for (const alias of aliases) {
    const matches = normalizedMap.filter(([key]) => key === alias || key.includes(alias));
    const positive = matches.find(([, value]) => parsePlainNumber(value) > 0);
    if (positive) return positive[1];
  }

  for (const alias of aliases) {
    const match = normalizedMap.find(([key]) => key === alias || key.includes(alias));
    if (match && match[1] !== "" && match[1] != null) return match[1];
  }

  return "";
}

function getCostAmount(row) {
  const aggregateActual = getNumericFieldByAliases(row, AGGREGATE_COST_ACTUAL_ALIASES);
  if (aggregateActual > 0) return aggregateActual;
  return sumNumericFieldsByAliases(row, DETAIL_COST_ACTUAL_ALIASES);
}

function hasCostFields(row) {
  return hasFieldByAliases(row, [
    ...AGGREGATE_COST_ACTUAL_ALIASES,
    ...DETAIL_COST_ACTUAL_ALIASES,
    ...COST_PLAN_ALIASES,
  ]);
}

function getNumericFieldByAliases(row, aliases) {
  const normalizedMap = Object.entries(row).map(([key, value]) => [compactKey(key), value]);
  for (const alias of aliases) {
    const match = normalizedMap.find(([key, value]) => key === alias && hasCellValue(value));
    if (match) return Math.max(0, parsePlainNumber(match[1]));
  }
  return 0;
}

function sumNumericFieldsByAliases(row, aliases) {
  const normalizedMap = Object.entries(row).map(([key, value]) => [compactKey(key), value]);
  const usedKeys = new Set();
  return aliases.reduce((sum, alias) => {
    const match = normalizedMap.find(([key, value]) => key === alias && hasCellValue(value) && !usedKeys.has(key));
    if (!match) return sum;
    usedKeys.add(match[0]);
    return sum + Math.max(0, parsePlainNumber(match[1]));
  }, 0);
}

function hasFieldByAliases(row, aliases) {
  const keys = Object.keys(row).map(compactKey);
  return aliases.some((alias) => keys.includes(alias));
}

function findFieldByAliasPriority(normalizedMap, aliases, allowPartial) {
  let firstExistingExact = null;

  for (const alias of aliases) {
    const match = normalizedMap.find(([key]) => (allowPartial ? key.includes(alias) : key === alias));
    if (!match) continue;
    if (hasCellValue(match[1])) return match;
    if (!allowPartial && !firstExistingExact) firstExistingExact = match;
  }

  return allowPartial ? null : firstExistingExact;
}

function getMonthField(row, monthKey) {
  const normalizedMap = Object.entries(row).map(([key, value]) => [compactKey(key), value]);
  const aliases = MONTH_ALIASES[monthKey] || [];
  const exact = normalizedMap.find(([key]) => aliases.includes(key));
  if (exact) return exact[1];
  const partial = normalizedMap.find(([key]) =>
    aliases.some((alias) => key.includes(alias) && (alias.includes("workload") || hasWorkloadMonthHint(key))),
  );
  return partial ? partial[1] : "";
}

function getMonthCostField(row, monthKey) {
  const normalizedMap = Object.entries(row).map(([key, value]) => [compactKey(key), value]);
  const aliases = MONTH_COST_ALIASES[monthKey] || [];
  const exact = normalizedMap.find(([key]) => aliases.includes(key));
  if (exact) return exact[1];
  const partial = normalizedMap.find(([key]) => aliases.some((alias) => key.includes(alias)));
  return partial ? partial[1] : "";
}

function hasWorkloadMonthHint(key) {
  return (
    key.includes("workload") ||
    key.includes("capacity") ||
    key.includes("utilization") ||
    key.includes("utilisation") ||
    key.includes("bebankerja") ||
    key.includes("load")
  );
}

function compactKey(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function normalizeHealth(value) {
  const normalized = compactKey(value);
  const score = parsePlainNumber(value);
  if (String(value ?? "").trim().match(/^[1-3]$/)) {
    if (score <= 1) return "Need Improvement";
    if (score === 2) return "Warning";
    return "Healthy";
  }
  if (normalized.includes("need") || normalized.includes("improve") || normalized.includes("critical") || normalized.includes("red")) {
    return "Need Improvement";
  }
  if (normalized.includes("warn") || normalized.includes("risk") || normalized.includes("yellow")) {
    return "Warning";
  }
  return "Healthy";
}

function normalizeDueStatus(value) {
  const normalized = compactKey(value);
  if (normalized.includes("over") || normalized.includes("late") || normalized.includes("terlambat")) return "Overdue";
  if (
    normalized.includes("duethis") ||
    normalized.includes("duenext") ||
    normalized.includes("risk") ||
    normalized.includes("soon") ||
    normalized.includes("warning")
  ) {
    return "At Risk";
  }
  return "On Track";
}

function inferDueStatusFromEndDate(endDate) {
  if (!(endDate instanceof Date) || Number.isNaN(endDate.getTime())) return "On Track";
  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const dueDate = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
  const daysUntilDue = Math.ceil((dueDate.getTime() - todayStart.getTime()) / 86400000);
  if (daysUntilDue < 0) return "Overdue";
  if (daysUntilDue <= 45) return "At Risk";
  return "On Track";
}

function normalizeSchedule(value) {
  const score = parsePlainNumber(value);
  if (String(value ?? "").trim().match(/^[1-4]$/)) {
    if (score === 1) return "Delay";
    if (score === 2) return "Potential Delay";
    if (score === 4) return "Leading";
    return "On Time";
  }
  if (score > 0 && score < 10) {
    if (score < 0.85) return "Delay";
    if (score < 1) return "Potential Delay";
    if (score > 1.05) return "Leading";
    return "On Time";
  }
  const normalized = compactKey(value);
  if (normalized.includes("potential")) return "Potential Delay";
  if (normalized.includes("delay") || normalized.includes("late") || normalized.includes("slip")) return "Delay";
  if (normalized.includes("lead") || normalized.includes("ahead")) return "Leading";
  return "On Time";
}

function normalizeCondition(value, fallback) {
  const text = String(value || "").trim();
  return text || fallback;
}

function normalizeResourceCondition(value) {
  const text = String(value || "").trim();
  const score = parsePlainNumber(value);
  if (text.match(/^[1-4]$/)) {
    if (score === 1) return "Workplan > 20%";
    if (score === 2) return "Workplan > 0-20%";
    if (score === 3) return "Workplan = Precalc";
    return "Workplan < Precalc";
  }
  return text || "Normal";
}

function normalizeCostCondition(value) {
  const text = String(value || "").trim();
  const score = parsePlainNumber(value);
  if (text.match(/^[1-4]$/)) {
    if (score <= 2) return "Shortage";
    if (score === 3) return "On Budget";
    return "Surplus";
  }
  if (!text) return "On Budget";
  return text;
}

function parseOpenIssue(statusValue, issueTypeValue) {
  const numeric = parsePlainNumber(statusValue);
  if (numeric > 0) return Math.round(numeric);

  const status = compactKey(statusValue);
  if (status.includes("open") || status.includes("aktif") || status.includes("active")) return 1;
  if (status.includes("closed") || status.includes("close") || status.includes("done") || status.includes("resolved")) return 0;
  return hasIssueText(issueTypeValue) ? 1 : 0;
}

function hasIssueText(value) {
  const text = String(value || "").trim();
  const normalized = compactKey(text);
  return Boolean(text && normalized && normalized !== "none" && normalized !== "na");
}

function parseDateValue(value) {
  if (!value) return null;
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value;
  if (typeof value === "number" && value > 20000) {
    const excelEpoch = new Date(Date.UTC(1899, 11, 30));
    const parsed = new Date(excelEpoch.getTime() + value * 86400000);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  const raw = String(value).trim();
  if (!raw) return null;

  const direct = new Date(raw);
  if (!Number.isNaN(direct.getTime())) return direct;

  const parts = raw.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})$/);
  if (!parts) return null;

  const day = Number(parts[1]);
  const month = Number(parts[2]) - 1;
  const year = Number(parts[3].length === 2 ? `20${parts[3]}` : parts[3]);
  const parsed = new Date(year, month, day);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function parsePlainNumber(value) {
  if (typeof value === "number") return value;
  const raw = String(value || "").trim();
  if (!raw) return 0;
  let valueText = raw.replace(/[^\d,.-]/g, "");
  const commaCount = (valueText.match(/,/g) || []).length;
  const dotCount = (valueText.match(/\./g) || []).length;

  if (commaCount > 0 && dotCount > 0) {
    valueText =
      valueText.lastIndexOf(",") > valueText.lastIndexOf(".")
        ? valueText.replace(/\./g, "").replace(",", ".")
        : valueText.replace(/,/g, "");
  } else if (commaCount > 1) {
    valueText = valueText.replace(/,/g, "");
  } else if (dotCount > 1) {
    valueText = valueText.replace(/\./g, "");
  } else if (commaCount === 1) {
    const decimals = valueText.split(",")[1]?.length || 0;
    valueText = decimals <= 2 ? valueText.replace(",", ".") : valueText.replace(",", "");
  }

  const parsed = Number(valueText);
  return Number.isFinite(parsed) ? parsed : 0;
}

function parseWorkload(value) {
  if (value === "" || value == null) return 0;
  const raw = String(value).trim();
  const parsed = parsePlainNumber(value);
  if (raw.includes("%")) return parsed / 100;
  return parsed > 10 ? parsed / 100 : parsed;
}

function isProjectActiveInMonth(project, month) {
  const monthStart = new Date(DASHBOARD_YEAR, month.index, 1);
  const monthEnd = new Date(DASHBOARD_YEAR, month.index + 1, 0, 23, 59, 59, 999);
  const startDate = project.startDate instanceof Date ? project.startDate : new Date(DASHBOARD_YEAR, 0, 1);
  const endDate = project.endDate instanceof Date ? project.endDate : new Date(DASHBOARD_YEAR, 11, 31, 23, 59, 59, 999);
  return startDate <= monthEnd && endDate >= monthStart;
}

function getDashboardMonths(projects) {
  if (!projects.length) return MONTHS;

  const activeMonths = MONTHS.filter((month) => projects.some((project) => isProjectActiveInMonth(project, month))).map((month) => month.index);

  if (!activeMonths.length) return MONTHS;
  const firstMonth = Math.min(...activeMonths);
  return MONTHS.filter((month) => month.index >= firstMonth);
}

function getWorkloadMode(projects) {
  if (!projects.length) return "empty";
  const liveCount = projects.filter(projectHasUsableWorkload).length;
  if (liveCount === 0) return "proxy";
  if (liveCount === projects.length) return "live";
  return "mixed";
}

function projectHasUsableWorkload(project) {
  if (typeof project.hasUsableWorkloadInput === "boolean") {
    return project.hasUsableWorkloadInput;
  }
  return MONTHS.some((month) => (project.workload?.[month.key] || 0) > 0);
}

function getProxyWorkload(project) {
  return MONTHS.reduce((workload, month) => {
    workload[month.key] = isProjectActiveInMonth(project, month) ? 1 : 0;
    return workload;
  }, {});
}

function getCurrentWorkload(project) {
  const nonZero = MONTHS.map((month) => project.workload[month.key] || 0).filter((value) => value > 0);
  if (!nonZero.length) return 0;
  return nonZero.reduce((sum, value) => sum + value, 0) / nonZero.length;
}

function getPriority(project, workload, rules) {
  const isTroubledHealth = project.health === "Warning" || project.health === "Need Improvement";
  const isCritical =
    isTroubledHealth &&
    project.dueStatus === "Overdue" &&
    project.schedule === "Delay" &&
    workload > rules.criticalWorkload;

  if (isCritical) return "Critical";
  if (project.dueStatus === "Overdue" || project.openIssue >= rules.highIssueCount) return "High";
  if (project.schedule === "Potential Delay" || !isNormalResource(project.resource) || project.health === "Warning") return "Medium";
  return "Normal";
}

function isNormalResource(value) {
  const text = String(value || "").trim().toLowerCase();
  if (text.includes("= precalc")) return true;
  const normalized = compactKey(value);
  return normalized.includes("normal") || normalized.includes("ok") || normalized.includes("available");
}

function countBy(items, field) {
  const map = new Map();
  items.forEach((item) => {
    const key = item[field] || "Unknown";
    map.set(key, (map.get(key) || 0) + 1);
  });
  return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
}

function dueByBusinessUnit(items) {
  return stackedBy(items, "bu", "dueStatus");
}

function stackedBy(items, groupField, stackField) {
  const rows = new Map();
  items.forEach((item) => {
    const group = item[groupField] || "Unknown";
    const stack = item[stackField] || "Unknown";
    const row = rows.get(group) || { name: group };
    row[stack] = (row[stack] || 0) + 1;
    rows.set(group, row);
  });
  return Array.from(rows.values());
}

function issueByType(items) {
  const map = new Map();
  items.forEach((item) => {
    if (!item.openIssue) return;
    const key = getIssueTypeLabel(item.issueType);
    map.set(key, (map.get(key) || 0) + item.openIssue);
  });
  return Array.from(map.entries()).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
}

function getIssueTypeLabel(value) {
  const text = String(value || "").trim();
  const normalized = compactKey(text);
  if (!text || !normalized || normalized === "none" || normalized === "na") return "Uncategorized";
  return text;
}

function getPmMonthWorkloads(items) {
  const map = new Map();
  items.forEach((item) => {
    const row = map.get(item.pm) || { pm: item.pm };
    MONTHS.forEach((month) => {
      row[month.key] = (row[month.key] || 0) + (item.workload[month.key] || 0);
    });
    map.set(item.pm, row);
  });
  return Array.from(map.values()).sort((a, b) => a.pm.localeCompare(b.pm));
}

function countProjectsByPm(items) {
  const map = new Map();
  items.forEach((item) => {
    map.set(item.pm, (map.get(item.pm) || 0) + 1);
  });
  return Array.from(map.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}

function getPmMonthCostTrend(items) {
  const map = new Map();
  items.forEach((item) => {
    const row = map.get(item.pm) || { pm: item.pm };
    MONTHS.forEach((month) => {
      const explicitMonthlyCost = item.monthlyCost?.[month.key] || 0;
      const weightedCost =
        explicitMonthlyCost > 0
          ? explicitMonthlyCost
          : item.hasCostInput && isProjectActiveInMonth(item, month)
            ? (item.costAmount || 0) * (item.workload[month.key] || 0)
            : 0;
      row[month.key] = (row[month.key] || 0) + weightedCost;
    });
    map.set(item.pm, row);
  });
  return Array.from(map.values()).sort((a, b) => a.pm.localeCompare(b.pm));
}

function getPmPortfolioSummary(items) {
  const map = new Map();
  items.forEach((item) => {
    const row =
      map.get(item.pm) || {
        pm: item.pm,
        projects: 0,
        portfolioValue: 0,
        costExposure: 0,
        valueAtRisk: 0,
    };
    row.projects += 1;
    row.portfolioValue += item.value || 0;
    row.costExposure += item.hasCostInput ? item.costAmount || 0 : 0;
    if (item.health !== "Healthy" || item.dueStatus === "Overdue") row.valueAtRisk += item.value || 0;
    map.set(item.pm, row);
  });
  return Array.from(map.values()).sort((a, b) => b.costExposure - a.costExposure);
}

function workloadByBu(items) {
  const map = new Map();
  items.forEach((item) => {
    const current = map.get(item.bu) || { name: item.bu, workload: 0, count: 0 };
    current.workload += item.currentWorkload || getCurrentWorkload(item);
    current.count += 1;
    map.set(item.bu, current);
  });
  return Array.from(map.values()).map((item) => ({
    name: item.name,
    workload: Number((item.workload / Math.max(item.count, 1)).toFixed(2)),
  }));
}

function getPmStatusDistribution(rows, rules, months = MONTHS) {
  const counts = { Overloaded: 0, Normal: 0, Underutilized: 0 };
  rows.forEach((row) => {
    const average =
      months.reduce((sum, month) => sum + (row[month.key] || 0), 0) / Math.max(months.length, 1);
    if (average > rules.overloadedWorkload) counts.Overloaded += 1;
    else if (average < rules.underutilizedWorkload) counts.Underutilized += 1;
    else counts.Normal += 1;
  });
  return Object.entries(counts).map(([name, value]) => ({ name, value }));
}

function getPmRiskList(items) {
  const map = new Map();
  items.forEach((item) => {
    const row = map.get(item.pm) || { pm: item.pm, riskyProjects: 0, overdueProjects: 0, projects: 0 };
    row.projects += 1;
    if (item.health !== "Healthy" || item.dueStatus === "Overdue") row.riskyProjects += 1;
    if (item.dueStatus === "Overdue") row.overdueProjects += 1;
    map.set(item.pm, row);
  });
  return Array.from(map.values())
    .filter((item) => item.riskyProjects > 0)
    .sort((a, b) => b.riskyProjects - a.riskyProjects || b.overdueProjects - a.overdueProjects);
}

function prioritySort(a, b) {
  const order = { Critical: 0, High: 1, Medium: 2, Normal: 3 };
  return order[a.priority] - order[b.priority] || b.value - a.value || b.openIssue - a.openIssue;
}

export function formatCurrency(value) {
  if (!value) return "Rp 0";
  if (value >= 1_000_000_000) return `Rp ${(value / 1_000_000_000).toFixed(1)} M`;
  if (value >= 1_000_000) return `Rp ${(value / 1_000_000).toFixed(1)} Jt`;
  return `Rp ${new Intl.NumberFormat("id-ID").format(value)}`;
}

export function formatPercent(value) {
  return `${Math.round((value || 0) * 100)}%`;
}
