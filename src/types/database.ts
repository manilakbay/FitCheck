import type {
  ActivityEntry,
  DailyGoal,
  FoodEntry,
  Profile,
  WeightRecord,
} from "@/types/models";

type TimestampFields = "created_at" | "updated_at";

type ProfileInsert = Partial<Pick<Profile, TimestampFields>> &
  Pick<Profile, "id"> &
  Partial<Omit<Profile, "id" | TimestampFields>>;

type ProfileUpdate = Partial<Omit<Profile, "id" | "created_at">>;

type WeightRecordInsert = Partial<Pick<WeightRecord, "id" | "recorded_on" | TimestampFields>> &
  Pick<WeightRecord, "user_id" | "weight_kg">;

type WeightRecordUpdate = Partial<Omit<WeightRecord, "id" | "user_id" | "created_at">>;

type FoodEntryInsert = Partial<Pick<FoodEntry, "id" | "entry_date" | TimestampFields>> &
  Pick<
    FoodEntry,
    "user_id" | "meal_type" | "food_name" | "quantity" | "unit"
  > &
  Partial<
    Pick<FoodEntry, "calories" | "protein_g" | "carbs_g" | "fat_g" | "entry_date">
  >;

type FoodEntryUpdate = Partial<Omit<FoodEntry, "id" | "user_id" | "created_at">>;

type ActivityEntryInsert = Partial<Pick<ActivityEntry, "id" | "entry_date" | TimestampFields>> &
  Pick<
    ActivityEntry,
    "user_id" | "activity_type" | "duration_min" | "intensity"
  > &
  Partial<Pick<ActivityEntry, "distance_km" | "calories_burned" | "entry_date">>;

type ActivityEntryUpdate = Partial<Omit<ActivityEntry, "id" | "user_id" | "created_at">>;

type DailyGoalInsert = Partial<Pick<DailyGoal, TimestampFields>> &
  Pick<DailyGoal, "user_id"> &
  Partial<
    Pick<
      DailyGoal,
      | "calorie_target"
      | "protein_target_g"
      | "carbs_target_g"
      | "fat_target_g"
      | "goal_weight_kg"
    >
  >;

type DailyGoalUpdate = Partial<Omit<DailyGoal, "user_id" | "created_at">>;

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: ProfileInsert;
        Update: ProfileUpdate;
        Relationships: [];
      };
      weight_records: {
        Row: WeightRecord;
        Insert: WeightRecordInsert;
        Update: WeightRecordUpdate;
        Relationships: [];
      };
      food_entries: {
        Row: FoodEntry;
        Insert: FoodEntryInsert;
        Update: FoodEntryUpdate;
        Relationships: [];
      };
      activity_entries: {
        Row: ActivityEntry;
        Insert: ActivityEntryInsert;
        Update: ActivityEntryUpdate;
        Relationships: [];
      };
      daily_goals: {
        Row: DailyGoal;
        Insert: DailyGoalInsert;
        Update: DailyGoalUpdate;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
