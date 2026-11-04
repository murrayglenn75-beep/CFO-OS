import test from "node:test";
import assert from "node:assert/strict";
import { calculateMetric } from "./metric_ontology.mjs";
const rows = [{amount_minor:500,status:"settled_sale"}, {amount_minor:100,status:"settled_refund"}, {amount_minor:1000,status:"pending_sale"}];
test("gross excludes refund and pending",()=>assert.equal(calculateMetric("gross_revenue",rows).amount_minor,500));
test("net subtracts refund",()=>assert.equal(calculateMetric("net_revenue",rows).amount_minor,400));
test("reject unknown metric",()=>assert.throws(()=>calculateMetric("revenue",rows),/Unknown metric/));
test("reject malformed records",()=>assert.throws(()=>calculateMetric("net_revenue",[{amount_minor:0.1,status:"settled_sale"}]),/Invalid/));
test("reject invalid input",()=>assert.throws(()=>calculateMetric("net_revenue",null),TypeError));
