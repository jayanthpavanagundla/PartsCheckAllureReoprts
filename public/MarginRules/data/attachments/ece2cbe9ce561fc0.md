# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: repairer\marginRules\marginRuleCreation.repairerAdmin.spec.ts >> Repairer: Margin Rules Settings >> Set margin rule as default
- Location: tests\repairer\marginRules\marginRuleCreation.repairerAdmin.spec.ts:41:9

# Error details

```
Error: expect(locator).toHaveAttribute(expected) failed

Locator:  locator('tr.mrDisplayRow').filter({ has: locator('[data-rule="Auto Rule Z43PF9"]') }).locator('button[data-action="set-default"]')
Expected: "1"
Received: "0"
Timeout:  30000ms

Call log:
  - Expect "toHaveAttribute" with timeout 30000ms
  - waiting for locator('tr.mrDisplayRow').filter({ has: locator('[data-rule="Auto Rule Z43PF9"]') }).locator('button[data-action="set-default"]')
    62 × locator resolved to <button type="button" data-default="0" data-rule-id="6706" data-action="set-default" title="Set as default rule" data-rule="Auto Rule Z43PF9" class="tw:inline-flex tw:items-center tw:justify-center tw:w-7 tw:h-7 tw:rounded tw:border tw:border-gray-300 tw:bg-white tw:text-gray-500 tw:cursor-pointer tw:hover:bg-gray-50">…</button>
       - unexpected value "0"

```

```yaml
- button "Set as default rule":
  - img
```

# Test source

```ts
  247 |             const autoRow = this.page.locator(`#mrExcAutoRows .mr-exc-auto-row[data-part="${partType}"]`);
  248 |             const cells = autoRow.locator("span");
  249 |             await step(`Verify "Not accepted" exception row for ${partType} is shown`, async () => {
  250 |                 await expect(autoRow).toBeVisible();
  251 |             });
  252 |             await step('Verify badge text: "Not accepted"', async () => {
  253 |                 await expect(cells.nth(0)).toHaveText("Not accepted");
  254 |             });
  255 |             await step(`Verify part type: "${partType}"`, async () => {
  256 |                 await expect(cells.nth(1)).toHaveText(partType);
  257 |             });
  258 |             await step('Verify source: "From pricing rule"', async () => {
  259 |                 await expect(cells.nth(2)).toHaveText("From pricing rule");
  260 |             });
  261 |         });
  262 |     }
  263 |     async clickSaveChanges() {
  264 |         await step("Click on Save Changes", async () => {
  265 |             await expect(this.saveButton).toBeEnabled();
  266 |             await this.saveButton.click();
  267 |             // Back on the rules list ("+ Add rule" only exists there), from both Add and Edit forms
  268 |             await expect(this.addRuleButton).toBeVisible();
  269 |         });
  270 |     }
  271 |     /** Verifies the saved rule's row in "Your Rules" shows the pricing stored by fillPricingRules() */
  272 |     async verifySavedRule() {
  273 |         await step(`Verify saved rule "${this.ruleName}" in Your Rules`, async () => {
  274 |             const columnIndex = this.partColumnIndex;
  275 |             const ruleRow = this.page
  276 |                 .locator("tr.mrDisplayRow")
  277 |                 .filter({ has: this.page.locator(`[data-rule="${this.ruleName}"]`) });
  278 |             await expect(ruleRow).toHaveCount(1);
  279 | 
  280 |             for (const rule of this.pricingRules) {
  281 |                 // "Charge of List" displays as "% of List"; Markup/Show Markup on Cost (and not accepted) as "% Markup of Cost"
  282 |                 const expected =
  283 |                     rule.pricingMethod === "Charge of List"
  284 |                         ? `${rule.value}% of List`
  285 |                         : `${rule.value}% Markup of Cost`;
  286 |                 await step(`${rule.partType}: ${expected}`, async () => {
  287 |                     await expect(ruleRow.locator("td").nth(columnIndex[rule.partType])).toHaveText(expected);
  288 |                 });
  289 |             }
  290 |         });
  291 |     }
  292 |     /** Deletes the rule created by this test via the Delete popup, then verifies it is gone after refresh */
  293 |     async deleteSavedRule() {
  294 |         await step(`Delete rule "${this.ruleName}"`, async () => {
  295 |             const ruleRow = this.page
  296 |                 .locator("tr.mrDisplayRow")
  297 |                 .filter({ has: this.page.locator(`[data-rule="${this.ruleName}"]`) });
  298 |             const deleteModal = this.page.locator("#marginDeleteModal");
  299 | 
  300 |             await step("Click Delete icon on the rule row", async () => {
  301 |                 await this.clickRowButton(ruleRow.locator('button[data-action="delete"]'));
  302 |                 await expect(deleteModal).toBeVisible();
  303 |             });
  304 |             await step('Verify popup message "Are you sure you want to delete this rule?"', async () => {
  305 |                 await expect(deleteModal).toContainText("Are you sure you want to delete this rule?");
  306 |             });
  307 |             await step("Click Delete Rule in popup", async () => {
  308 |                 await deleteModal.locator("button.marginDeleteConfirm").click();
  309 |                 await expect(deleteModal).toBeHidden();
  310 |                 await expect(ruleRow).toHaveCount(0);
  311 |             });
  312 |             await step("Refresh and verify rule is not in Your Rules", async () => {
  313 |                 await this.page.reload();
  314 |                 await expect(this.addRuleButton).toBeVisible();
  315 |                 await expect(ruleRow).toHaveCount(0);
  316 |             });
  317 |         });
  318 |     }
  319 |     /** Stores and logs the current default rule, which may be a System Rule or one of Your Rules */
  320 |     async capturePreviousDefaultRule(): Promise<string> {
  321 |         return await step("Capture previous default rule", async (ctx) => {
  322 |             const currentDefault = this.page.locator('button[data-action="set-default"][data-default="1"]');
  323 |             await expect(currentDefault, "Exactly one rule (System or Your Rules) must be the default").toHaveCount(1);
  324 |             this.previousDefaultRuleName = (await currentDefault.getAttribute("data-rule"))!;
  325 |             // Your Rules rows are tr.mrDisplayRow; System Rules rows are not
  326 |             const isYourRule = (await this.ruleRow(this.previousDefaultRuleName).count()) > 0;
  327 |             await ctx.displayName(
  328 |                 `Previous default rule: ${this.previousDefaultRuleName} (${isYourRule ? "Your Rules" : "System Rules"})`
  329 |             );
  330 |             return this.previousDefaultRuleName;
  331 |         });
  332 |     }
  333 |     /** Picks a random non-default rule from "Your Rules", clicks its Set as default button and stores its name */
  334 |     async setRandomRuleAsDefault(): Promise<string> {
  335 |         await this.capturePreviousDefaultRule();
  336 |         return await step("Set a random rule from Your Rules as default", async (ctx) => {
  337 |             const count = await this.nonDefaultRuleButtons.count();
  338 |             expect(count, "Your Rules should have at least one non-default rule").toBeGreaterThan(0);
  339 |             const setDefaultButton = this.nonDefaultRuleButtons.nth(Math.floor(Math.random() * count));
  340 |             this.defaultRuleName = (await setDefaultButton.getAttribute("data-rule"))!;
  341 |             await ctx.displayName(
  342 |                 `Set rule as default: ${this.defaultRuleName} (previous: ${this.previousDefaultRuleName})`
  343 |             );
  344 | 
  345 |             await this.clickRowButton(setDefaultButton);
  346 |             await expect(this.ruleRow(this.defaultRuleName).locator('button[data-action="set-default"]'))
> 347 |                 .toHaveAttribute("data-default", "1");
      |                  ^ Error: expect(locator).toHaveAttribute(expected) failed
  348 |             return this.defaultRuleName;
  349 |         });
  350 |     }
  351 |     /** Clicks Set as default on the rule created by this test (this.ruleName) and stores it as the default rule */
  352 |     async setSavedRuleAsDefault(): Promise<string> {
  353 |         await this.capturePreviousDefaultRule();
  354 |         return await step(`Set rule "${this.ruleName}" as default (previous: ${this.previousDefaultRuleName})`, async () => {
  355 |             const setDefaultButton = this.ruleRow(this.ruleName).locator('button[data-action="set-default"]');
  356 |             await step(`Click Set as default on "${this.ruleName}"`, async () => {
  357 |                 await this.clickRowButton(setDefaultButton);
  358 |             });
  359 |             await step("Verify Set as default button is marked current default", async () => {
  360 |                 await expect(setDefaultButton).toHaveAttribute("data-default", "1");
  361 |             });
  362 |             this.defaultRuleName = this.ruleName;
  363 |             return this.defaultRuleName;
  364 |         });
  365 |     }
  366 |     /** After the default rule is deleted, verifies the default falls back to the given System Rule */
  367 |     async verifyDefaultFallsBackToSystemRule(systemRuleName = "Standard") {
  368 |         await step(`Verify default falls back to System Rule "${systemRuleName}"`, async () => {
  369 |             const setDefaultButton = this.page.locator(
  370 |                 `button[data-action="set-default"][data-rule="${systemRuleName}"]`
  371 |             );
  372 |             const systemRuleRow = setDefaultButton.locator("xpath=ancestor::tr[1]");
  373 |             await step(`Verify "${systemRuleName}" is listed in System Rules`, async () => {
  374 |                 await expect(systemRuleRow.locator("td").first().getByText("SYSTEM", { exact: true })).toBeVisible();
  375 |             });
  376 |             await step(`Verify DEFAULT pill is shown on "${systemRuleName}"`, async () => {
  377 |                 await expect(systemRuleRow.locator("td").first().getByText("DEFAULT", { exact: true })).toBeVisible();
  378 |             });
  379 |             await step(`Verify Set as default button on "${systemRuleName}" is marked current default`, async () => {
  380 |                 await expect(setDefaultButton).toHaveAttribute("data-default", "1");
  381 |                 await expect(setDefaultButton).toBeDisabled();
  382 |             });
  383 |             await step("Verify no other rule (System or Your Rules) is default", async () => {
  384 |                 await expect(this.page.locator('button[data-action="set-default"][data-default="1"]')).toHaveCount(1);
  385 |             });
  386 |         });
  387 |     }
  388 |     /** Reloads after a short wait and verifies the rule set by setRandomRuleAsDefault() is the only one with the DEFAULT pill */
  389 |     async verifyDefaultRule() {
  390 |         await step(`Verify rule "${this.defaultRuleName}" is the default rule`, async () => {
  391 |             await step("Wait and reload Margin Settings", async () => {
  392 |                 await this.page.waitForTimeout(2500);
  393 |                 await this.page.reload();
  394 |                 await expect(this.addRuleButton).toBeVisible();
  395 |             });
  396 |             const ruleRow = this.ruleRow(this.defaultRuleName);
  397 |             await step("Verify DEFAULT pill is shown on the rule", async () => {
  398 |                 await expect(ruleRow.locator("td").first().getByText("DEFAULT", { exact: true })).toBeVisible();
  399 |             });
  400 |             await step("Verify Set as default button is marked current default", async () => {
  401 |                 const setDefaultButton = ruleRow.locator('button[data-action="set-default"]');
  402 |                 await expect(setDefaultButton).toHaveAttribute("data-default", "1");
  403 |                 await expect(setDefaultButton).toBeDisabled();
  404 |             });
  405 |             await step(`Verify previous default "${this.previousDefaultRuleName}" is no longer default`, async () => {
  406 |                 await expect(
  407 |                     this.page.locator(
  408 |                         `button[data-action="set-default"][data-rule="${this.previousDefaultRuleName}"][data-default="1"]`
  409 |                     )
  410 |                 ).toHaveCount(0);
  411 |             });
  412 |             await step("Verify no other rule (System or Your Rules) is default", async () => {
  413 |                 await expect(this.page.locator('button[data-action="set-default"][data-default="1"]')).toHaveCount(1);
  414 |             });
  415 |         });
  416 |     }
  417 |     /** Stores Your Rules in their current (default) display order, to compare against after unfavouriting */
  418 |     async captureDefaultSortOrder(): Promise<string[]> {
  419 |         return await step("Capture default sort order of Your Rules", async (ctx) => {
  420 |             const rules = await this.getYourRulesOrder();
  421 |             expect(rules.length, "Your Rules should have at least one rule").toBeGreaterThan(0);
  422 |             this.defaultSortOrder = rules.map((r) => r.name);
  423 |             await ctx.displayName(`Default sort order: ${this.defaultSortOrder.join(" | ")}`);
  424 |             return this.defaultSortOrder;
  425 |         });
  426 |     }
  427 |     /** Clicks the Favourite star on a random unfavourited rule, reloads and verifies it is pinned to the top */
  428 |     async favouriteRandomRule(): Promise<string> {
  429 |         return await step("Favourite a random rule", async (ctx) => {
  430 |             const unfavourited = (await this.getYourRulesOrder()).filter((r) => !r.pinned);
  431 |             expect(unfavourited.length, "Your Rules should have at least one unfavourited rule").toBeGreaterThan(0);
  432 |             this.favouriteRuleName = unfavourited[Math.floor(Math.random() * unfavourited.length)].name;
  433 |             await ctx.displayName(`Favourite rule: ${this.favouriteRuleName}`);
  434 | 
  435 |             await this.toggleFavourite(this.favouriteRuleName, true);
  436 |             await this.reloadMarginSettings();
  437 |             await this.verifyFavouriteState(this.favouriteRuleName, true);
  438 |             await this.verifyPinnedToTop(this.favouriteRuleName);
  439 |             return this.favouriteRuleName;
  440 |         });
  441 |     }
  442 |     /** Clicks the Favourite star again on the rule from favouriteRandomRule(), reloads and verifies default sort order is restored */
  443 |     async unfavouriteRule() {
  444 |         await step(`Unfavourite rule "${this.favouriteRuleName}"`, async () => {
  445 |             await this.toggleFavourite(this.favouriteRuleName, false);
  446 |             await this.reloadMarginSettings();
  447 |             await this.verifyFavouriteState(this.favouriteRuleName, false);
```