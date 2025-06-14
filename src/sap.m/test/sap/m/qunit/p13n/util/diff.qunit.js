/*!
 * ${copyright}
 */
/*global QUnit */
sap.ui.define(['sap/m/p13n/util/diff'], function(diff) {
	"use strict";

	QUnit.module("diff");

	QUnit.test("simple arrays", function(assert) {
		const aData1 = [1,2,3,4,5];
		const aData2 = [1,4,5,6,7];
		const aData3 = [1,6,7,4,5];
		const aData4 = [1,6,7,2,3];
		const aData5 = [3,4,5,6,7];
		const aData6 = [4,5,7];
		//const aData7 = [9,8,4,4,3,2,9];
		const aData8 = [1,4,5,2,3];
		const aData9 = [1,7,8,9,2,3,4,5];
		const aData10 = [5,4,3,2,1];
		const aData11 = [];
		const aData12 = [1,3,2,5,4];
		const aData13 = [1,2,3,3,3,4,5];
		const aData14 = [3,3,2,1,3,4,5];
		const aData15 = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28];
		const aData16 = [3,18,29,30,31,32,33,34,35,36,37];
		const aData17 = [1,2,1,2,1];
		const aData18 = [2,1,2,1,2];
		const aData19 = [1,2,3,4,5,6];
		const aData20 = [1,2,3,4,2,6];
		const aData21 = [1,2,3,4,5,1];
		const aData22 = [8,1,3,1,7,2,6,3,6,9];
		const aData23 = [1,9,7,1,5,9,1,9,9,6];
		const aData24 = [1,2,3,4,2,6,2];
		let aDiff;

		aDiff = [
					{ index: 1, type: 'insert' },
					{ index: 2, type: 'insert' },
					{ index: 3, type: 'insert' },
					{ index: 4, type: 'insert' },
					{ index: 5, type: 'insert' },
					{ index: 8, type: 'delete' },
					{ index: 8, type: 'delete' }
				];
		assert.deepEqual(diff(aData8, aData9), aDiff, "diff between data 8 and 9");
		assert.deepEqual(diff(aData8, aData9, {replace: true}), aDiff, "diff between data 8 and 9 with replace option");

		aDiff = [
					{ index: 1, type: 'delete' },
					{ index: 1, type: 'delete' },
					{ index: 3, type: 'insert' },
					{ index: 4, type: 'insert' }
				];
		assert.deepEqual(diff(aData1, aData2), aDiff, "diff between data 1 and 2");
		assert.deepEqual(diff(aData1, aData2, {replace: true}), aDiff, "diff between data 1 and 2 with replace option");

		aDiff = [
					{ index: 1, type: 'delete' },
					{ index: 1, type: 'delete' },
					{ index: 1, type: 'insert' },
					{ index: 2, type: 'insert' }
				];
		assert.deepEqual(diff(aData1, aData3), aDiff, "diff between data 1 and 3");

		aDiff = [
					{ index: 1, type: 'replace' },
					{ index: 2, type: 'replace' }
				];
		assert.deepEqual(diff(aData1, aData3, {replace: true}), aDiff, "diff between data 1 and 3 with replace option");

		aDiff = [
					{ index: 1, type: 'insert' },
					{ index: 2, type: 'insert' },
					{ index: 5, type: 'delete' },
					{ index: 5, type: 'delete' }
				];
		assert.deepEqual(diff(aData1, aData4), aDiff, "diff between data 1 and 4");
		assert.deepEqual(diff(aData1, aData4, {replace: true}), aDiff, "diff between data 1 and 4 with replace option");

		aDiff = [
					{ index: 1, type: 'insert' },
					{ index: 2, type: 'insert' },
					{ index: 5, type: 'delete' },
					{ index: 5, type: 'delete' }
				];
		assert.deepEqual(diff(aData2, aData3), aDiff, "diff between data 2 and 3");
		assert.deepEqual(diff(aData2, aData3, {replace: true}), aDiff, "diff between data 2 and 3 with replace option");

		aDiff = [
					{ index: 1, type: 'delete' },
					{ index: 1, type: 'delete' },
					{ index: 3, type: 'insert' },
					{ index: 4, type: 'insert' }
				];
		assert.deepEqual(diff(aData2, aData4), aDiff, "diff between data 2 and 4");
		assert.deepEqual(diff(aData2, aData4, {replace: true}), aDiff, "diff between data 2 and 4 with replace option");

		aDiff = [
					{ index: 3, type: 'delete' },
					{ index: 3, type: 'delete' },
					{ index: 3, type: 'insert' },
					{ index: 4, type: 'insert' }
				];
		assert.deepEqual(diff(aData3, aData4), aDiff, "diff between data 3 and 4");

		aDiff = [
					{ index: 3, type: 'replace' },
					{ index: 4, type: 'replace' }
				];
		assert.deepEqual(diff(aData3, aData4, {replace: true}), aDiff, "diff between data 3 and 4 with replace option");

		aDiff = [
					{ index: 0, type: 'delete' },
					{ index: 0, type: 'delete' },
					{ index: 3, type: 'insert' },
					{ index: 4, type: 'insert' }
				];
		assert.deepEqual(diff(aData1, aData5), aDiff, "diff between data 1 and 5");
		assert.deepEqual(diff(aData1, aData5, {replace: true}), aDiff, "diff between data 1 and 5 with replace option");

		aDiff = [
					{ index: 0, type: 'insert' },
					{ index: 1, type: 'insert' },
					{ index: 5, type: 'delete' },
					{ index: 5, type: 'delete' }
				];
		assert.deepEqual(diff(aData5, aData1), aDiff, "diff between data 5 and 1");
		assert.deepEqual(diff(aData5, aData1, {replace: true}), aDiff, "diff between data 5 and 1 with replace option");

		aDiff = [
					{ index: 0, type: 'insert' },
					{ index: 1, type: 'insert' },
					{ index: 2, type: 'insert' },
					{ index: 3, type: 'insert' },
					{ index: 5, type: 'delete' },
					{ index: 5, type: 'delete' },
					{ index: 5, type: 'delete' },
					{ index: 5, type: 'delete' }
				];
		assert.deepEqual(diff(aData1, aData10), aDiff, "diff between data 1 and 10");
		assert.deepEqual(diff(aData1, aData10, {replace: true}), aDiff, "diff between data 1 and 10 with replace option");

		aDiff = [
					{ index: 0, type: 'insert' },
					{ index: 1, type: 'insert' },
					{ index: 2, type: 'insert' },
					{ index: 3, type: 'insert' },
					{ index: 4, type: 'insert' }
				];
		assert.deepEqual(diff(aData11, aData1), aDiff, "diff between data 1 and 11");
		assert.deepEqual(diff(aData11, aData1, {replace: true}), aDiff, "diff between data 11 and 1 with replace option");

		aDiff = [
					{ index: 0, type: 'delete' },
					{ index: 0, type: 'delete' },
					{ index: 0, type: 'delete' },
					{ index: 0, type: 'delete' },
					{ index: 0, type: 'delete' }
				];
		assert.deepEqual(diff(aData1, aData11), aDiff, "diff between data 11 and 1");
		assert.deepEqual(diff(aData1, aData11, {replace: true}), aDiff, "diff between data 11 and 1 with replace option");

		aDiff = [
					{ index: 1, type: 'insert' },
					{ index: 3, type: 'delete' },
					{ index: 3, type: 'insert' },
					{ index: 5, type: 'delete' }
				];
		assert.deepEqual(diff(aData1, aData12), aDiff, "diff between data 1 and 12");
		assert.deepEqual(diff(aData1, aData12, {replace: true}), aDiff, "diff between data 1 and 12 with replace option");

		aDiff = [
					{ index: 0, type: 'insert' },
					{ index: 1, type: 'delete' },
					{ index: 1, type: 'delete' },
					{ index: 2, type: 'insert' },
					{ index: 3, type: 'insert' },
					{ index: 4, type: 'insert' },
					{ index: 5, type: 'insert' },
					{ index: 6, type: 'insert' },
					{ index: 7, type: 'insert' }
				];
		assert.deepEqual(diff(aData6, aData9), aDiff, "diff between data 6 and 9");
		assert.deepEqual(diff(aData6, aData9, {replace: true}), aDiff, "diff between data 6 and 9 with replace option");

		aDiff = [
					{ index: 0, type: 'insert' },
					{ index: 1, type: 'insert' },
					{ index: 2, type: 'insert' },
					{ index: 4, type: 'delete' },
					{ index: 4, type: 'delete' },
					{ index: 4, type: 'delete' }
				];
		assert.deepEqual(diff(aData13, aData14), aDiff, "diff between data 13 and 14");
		assert.deepEqual(diff(aData13, aData14, {replace: true}), aDiff, "diff between data 13 and 14 with replace option");

		aDiff = [
					{ index: 0, type: 'delete' },
					{ index: 0, type: 'delete' },
					{ index: 1, type: 'delete' },
					{ index: 1, type: 'delete' },
					{ index: 1, type: 'delete' },
					{ index: 1, type: 'delete' },
					{ index: 1, type: 'delete' },
					{ index: 1, type: 'delete' },
					{ index: 1, type: 'delete' },
					{ index: 1, type: 'delete' },
					{ index: 1, type: 'delete' },
					{ index: 1, type: 'delete' },
					{ index: 1, type: 'delete' },
					{ index: 1, type: 'delete' },
					{ index: 1, type: 'delete' },
					{ index: 1, type: 'delete' },
					{ index: 2, type: 'delete' },
					{ index: 2, type: 'delete' },
					{ index: 2, type: 'delete' },
					{ index: 2, type: 'delete' },
					{ index: 2, type: 'delete' },
					{ index: 2, type: 'delete' },
					{ index: 2, type: 'delete' },
					{ index: 2, type: 'delete' },
					{ index: 2, type: 'delete' },
					{ index: 2, type: 'delete' },
					{ index: 2, type: 'insert' },
					{ index: 3, type: 'insert' },
					{ index: 4, type: 'insert' },
					{ index: 5, type: 'insert' },
					{ index: 6, type: 'insert' },
					{ index: 7, type: 'insert' },
					{ index: 8, type: 'insert' },
					{ index: 9, type: 'insert' },
					{ index: 10, type: 'insert' }
				];
		assert.deepEqual(diff(aData15, aData16), aDiff, "diff between data 15 and 16");

		aDiff = [
					{ "index": 0, "type": "delete" },
					{ "index": 0, "type": "delete" },
					{ "index": 1, "type": "delete" },
					{ "index": 1, "type": "delete" },
					{ "index": 1, "type": "delete" },
					{ "index": 1, "type": "delete" },
					{ "index": 1, "type": "delete" },
					{ "index": 1, "type": "delete" },
					{ "index": 1, "type": "delete" },
					{ "index": 1, "type": "delete" },
					{ "index": 1, "type": "delete" },
					{ "index": 1, "type": "delete" },
					{ "index": 1, "type": "delete" },
					{ "index": 1, "type": "delete" },
					{ "index": 1, "type": "delete" },
					{ "index": 1, "type": "delete" },
					{ "index": 2, "type": "replace" },
					{ "index": 3, "type": "replace" },
					{ "index": 4, "type": "replace" },
					{ "index": 5, "type": "replace" },
					{ "index": 6, "type": "replace" },
					{ "index": 7, "type": "replace" },
					{ "index": 8, "type": "replace" },
					{ "index": 9, "type": "replace" },
					{ "index": 10, "type": "replace" },
					{ "index": 11, "type": "delete" }
				];
		assert.deepEqual(diff(aData15, aData16, {replace: true}), aDiff, "diff between data 15 and 16 with replace option");

		aDiff = [
					{ index: 0, type: 'delete' },
					{ index: 0, type: 'delete' },
					{ index: 0, type: 'delete' },
					{ index: 0, type: 'delete' },
					{ index: 0, type: 'delete' },
					{ index: 0, type: 'insert' },
					{ index: 1, type: 'insert' },
					{ index: 2, type: 'insert' },
					{ index: 3, type: 'insert' },
					{ index: 4, type: 'insert' }
				];
		assert.deepEqual(diff(aData17, aData18), aDiff, "diff between data 17 and 18");

		aDiff = [
					{ index: 0, type: 'replace' },
					{ index: 1, type: 'replace' },
					{ index: 2, type: 'replace' },
					{ index: 3, type: 'replace' },
					{ index: 4, type: 'replace' }
				];
		assert.deepEqual(diff(aData17, aData18, {replace: true}), aDiff, "diff between data 17 and 18 with replace option");

		aDiff = [
					{ index: 4, type: 'delete' },
					{ index: 4, type: 'insert' }
				];
		assert.deepEqual(diff(aData19, aData20), aDiff, "diff between data 19 and 20");

		aDiff = [
					{ index: 4, type: 'replace' }
				];
		assert.deepEqual(diff(aData19, aData20, {replace: true}), aDiff, "diff between data 19 and 20 with replace option");

		aDiff = [
					{ index: 5, type: 'insert' }
				];
		assert.deepEqual(diff(aData1, aData21), aDiff, "diff between data 1 and 21");
		assert.deepEqual(diff(aData1, aData21, {replace: true}), aDiff, "diff between data 1 and 21 with replace option");

		aDiff = [
					{ index: 0, type: 'delete' },
					{ index: 0, type: 'delete' },
					{ index: 0, type: 'delete' },
					{ index: 0, type: 'delete' },
					{ index: 0, type: 'insert' },
					{ index: 1, type: 'insert' },
					{ index: 3, type: 'delete' },
					{ index: 3, type: 'delete' },
					{ index: 3, type: 'delete' },
					{ index: 3, type: 'delete' },
					{ index: 3, type: 'delete' },
					{ index: 3, type: 'insert' },
					{ index: 4, type: 'insert' },
					{ index: 5, type: 'insert' },
					{ index: 6, type: 'insert' },
					{ index: 7, type: 'insert' },
					{ index: 8, type: 'insert' },
					{ index: 9, type: 'insert' }
				];
		assert.deepEqual(diff(aData22, aData23), aDiff, "diff between data 22 and 23");

		aDiff = [
					{ index: 0, type: 'replace' },
					{ index: 1, type: 'replace' },
					{ index: 2, type: 'delete' },
					{ index: 2, type: 'delete' },
					{ index: 3, type: 'replace' },
					{ index: 4, type: 'replace' },
					{ index: 5, type: 'replace' },
					{ index: 6, type: 'replace' },
					{ index: 7, type: 'replace' },
					{ index: 8, type: 'insert' },
					{ index: 9, type: 'insert' }
				];
		assert.deepEqual(diff(aData22, aData23, {replace: true}), aDiff, "diff between data 22 and 23 with replace option");

		aDiff = [
					{ index: 4, type: 'delete' },
					{ index: 4, type: 'insert' },
					{ index: 6, type: 'insert' }
				];
		assert.deepEqual(diff(aData19, aData24), aDiff, "diff between data 19 and 24");

		aDiff = [
					{ index: 4, type: 'replace' },
					{ index: 6, type: 'insert' }
				];
		assert.deepEqual(diff(aData19, aData24, {replace: true}), aDiff, "diff between data 19 and 24 with replace option");
	});

	QUnit.test("random arrays", function(assert) {
		for (let t = 0; t < 100; t++) {
			const listA = [];
			const listB = [];
			const listACount = Math.floor(Math.random() * 101);
			const listBCount = Math.floor(Math.random() * 101);

			for (let a = 0; a < listACount; a++) {
				listA[a] = Math.floor(Math.random() * 101);
			}
			for (let b = 0; b < listBCount; b++) {
				listB[b] = Math.floor(Math.random() * 101);
			}

            const aDiff = diff(listA, listB);
			for (let d = 0; d < aDiff.length; d++) {
				const oDiff = aDiff[d];
				if (oDiff.type === "insert") {
					listA.splice(oDiff.index, 0, listB[oDiff.index]);
				} else {
					listA.splice(oDiff.index, 1);
				}
			}
			assert.deepEqual(listA, listB, "random arrayDiff " + (t + 1));
		}
	});

	QUnit.test("random arrays with replace option", function(assert) {
		for (let t = 0; t < 100; t++) {
			const listA = [];
			const listB = [];
			const listACount = Math.floor(Math.random() * 101);
			const listBCount = Math.floor(Math.random() * 101);

			for (let a = 0; a < listACount; a++) {
				listA[a] = Math.floor(Math.random() * 101);
			}
			for (let b = 0; b < listBCount; b++) {
				listB[b] = Math.floor(Math.random() * 101);
			}
			const aDiff = diff(listA, listB, {replace: true});
			for (let d = 0; d < aDiff.length; d++) {
				const oDiff = aDiff[d];
				if (oDiff.type === "insert") {
					listA.splice(oDiff.index, 0, listB[oDiff.index]);
				} else if (oDiff.type === "delete") {
					listA.splice(oDiff.index, 1);
				} else {
					listA[oDiff.index] = listB[oDiff.index];
				}
			}
			assert.deepEqual(listA, listB, "random arrayDiff " + (t + 1));
		}
	});

	QUnit.test("arrays with undefined values", function(assert) {
		const a1 = [1, 2, 3, undefined],
			a2 = [1, undefined],
			aDiff = diff(a1, a2),
			aResult = [
				{ index: 1, type: 'delete'},
				{ index: 1, type: 'delete'}
			];
		assert.deepEqual(aDiff, aResult, "diff must work with undefined values");
	});

	QUnit.test("arrays with includeReference option", function(assert) {
		for (let t = 0; t < 100; t++) {
			const listA = [];
			const listB = [];
			const listACount = Math.floor(Math.random() * 101);
			const listBCount = Math.floor(Math.random() * 101);
			const aDeletedItems = [];

			for (let a = 0; a < listACount; a++) {
				listA[a] = Math.floor(Math.random() * 101);
			}
			for (let b = 0; b < listBCount; b++) {
				listB[b] = Math.floor(Math.random() * 101);
			}

			const aDiff = diff(listA, listB, {
				includeReference: true
			});

			const aDeletedItemsFromReference = aDiff
				.filter((oDiff) => oDiff.type === "delete")
				.map((oDiff) => oDiff.affectedReference[oDiff.affectedIndex]);

			for (let d = 0; d < aDiff.length; d++) {
				const oDiff = aDiff[d];
				if (oDiff.type === "insert") {
					listA.splice(oDiff.index, 0, oDiff.affectedReference[oDiff.affectedIndex]);
				} else {
					const oDeletedItem = listA.splice(oDiff.index, 1);
					aDeletedItems.push(oDeletedItem[0]);
				}
			}
			assert.deepEqual(listA, listB, "random arrayDiff " + (t + 1));
			assert.deepEqual(aDeletedItems, aDeletedItemsFromReference, "deleted items for arrayDiff " + (t + 1));
		}
	});

});