import assert from "node:assert/strict";
import test from "node:test";
import {AssetModel,DATABASE_MODELS,GenerationJobModel,LessonRequestModel,UserModel,VideoModel,VideoPlanModel} from "../web/lib/db/models";

test("database model registry uses the documented six collections",()=>{
  assert.deepEqual(DATABASE_MODELS.map(model=>model.collection.collectionName),["users","lessonRequests","videoPlans","generationJobs","assets","videos"]);
});

test("documented uniqueness and owner-scoped indexes are registered",()=>{
  const has=(indexes:readonly (readonly [object,{unique?:unknown}])[],keys:Record<string,number>,unique=false)=>indexes.some(([fields,options])=>JSON.stringify(fields)===JSON.stringify(keys)&&Boolean(options.unique)===unique);
  assert.ok(has(UserModel.schema.indexes(),{authSubject:1},true));
  assert.ok(has(LessonRequestModel.schema.indexes(),{ownerId:1,updatedAt:-1,_id:-1}));
  assert.ok(has(VideoPlanModel.schema.indexes(),{lessonRequestId:1,version:1},true));
  assert.ok(has(GenerationJobModel.schema.indexes(),{idempotencyKey:1},true));
  assert.ok(has(AssetModel.schema.indexes(),{logicalKey:1,version:1},true));
  assert.ok(has(VideoModel.schema.indexes(),{generationJobId:1},true));
});

test("schemas reject unsupported locale and discard child-account fields",async()=>{
  const lesson=new LessonRequestModel({ownerId:"507f1f77bcf86cd799439011",learnerLevel:"CLASS_2",subjectKey:"MATH",topicKey:"EQUAL_GROUPS",language:"fr-FR",instruction:"Explain multiplication",status:"DRAFT",inputRevision:1,currentPlanVersion:0,createdAt:new Date(),updatedAt:new Date()});
  await assert.rejects(()=>lesson.validate(),/language/);
  const user=new UserModel({authSubject:"adult-1",status:"ACTIVE",childName:"Not allowed",createdAt:new Date(),updatedAt:new Date()});
  assert.equal("childName" in user.toObject(),false);
});
