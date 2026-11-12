import type {
  AdultAccountMetadata,
  AdultUserId,
  AssetId,
  GenerationJob,
  GenerationJobId,
  StoryProject,
  StoryProjectId,
  StoryboardId,
  StoryboardVersion,
  VideoRenderId,
  VideoRenderMetadata,
  VisualAssetRecord,
} from "./types";
export interface AdultAccountRepository {
  findById(id: AdultUserId): Promise<AdultAccountMetadata | null>;
  save(account: AdultAccountMetadata): Promise<void>;
}
export interface StoryProjectRepository {
  findOwnedById(ownerId: AdultUserId, id: StoryProjectId): Promise<StoryProject | null>;
  save(project: StoryProject, expectedInputRevision?: number): Promise<void>;
}
export interface StoryboardRepository {
  findOwnedById(ownerId: AdultUserId, id: StoryboardId): Promise<StoryboardVersion | null>;
  findVersion(
    ownerId: AdultUserId,
    projectId: StoryProjectId,
    version: number,
  ): Promise<StoryboardVersion | null>;
  insertImmutable(plan: StoryboardVersion): Promise<void>;
  saveStatus(plan: StoryboardVersion): Promise<void>;
}
export interface GenerationJobRepository {
  findOwnedById(ownerId: AdultUserId, id: GenerationJobId): Promise<GenerationJob | null>;
  findByIdempotencyKey(ownerId: AdultUserId, key: string): Promise<GenerationJob | null>;
  insert(job: GenerationJob): Promise<void>;
  save(job: GenerationJob): Promise<void>;
}
export interface VisualAssetRepository {
  findApprovedVersion(id: AssetId, version: number): Promise<VisualAssetRecord | null>;
}
export interface VideoRenderRepository {
  findOwnedById(ownerId: AdultUserId, id: VideoRenderId): Promise<VideoRenderMetadata | null>;
  save(video: VideoRenderMetadata): Promise<void>;
}
