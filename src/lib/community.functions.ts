import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type CommunitySummary = {
  id: string;
  name: string;
  description: string;
  imageUrl: string | null;
  inviteCode: string;
  inviteActive: boolean;
  isAdmin: boolean;
  memberCount: number;
};

export type CommunityMember = {
  userId: string;
  displayName: string;
  role: "admin" | "member";
  level: number;
  xp: number;
  streak: number;
  journeysCompleted: number;
  badges: number;
};

export type CommunityActivity = {
  id: string;
  kind: string;
  title: string;
  description: string;
  scheduledDate: string;
  scheduledTime: string | null;
  createdBy: string;
  participants: { userId: string; displayName: string; status: "started" | "completed" }[];
};

export type CommunityPost = {
  id: string;
  userId: string;
  authorName: string;
  kind: "versiculo" | "palavra";
  reference: string;
  content: string;
  createdAt: string;
};

export const listMyCommunities = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<CommunitySummary[]> => {
    const { supabase, userId } = context;
    const { data: memberships, error } = await supabase
      .from("community_members")
      .select("community_id,role")
      .eq("user_id", userId);
    if (error) throw new Error(error.message);
    const ids = (memberships ?? []).map((m) => m.community_id);
    if (ids.length === 0) return [];

    const [{ data: rows, error: cErr }, { data: allMembers, error: mErr }] = await Promise.all([
      supabase.from("communities").select("*").in("id", ids),
      supabase.from("community_members").select("community_id").in("community_id", ids),
    ]);
    if (cErr) throw new Error(cErr.message);
    if (mErr) throw new Error(mErr.message);

    const counts = new Map<string, number>();
    for (const m of allMembers ?? []) counts.set(m.community_id, (counts.get(m.community_id) ?? 0) + 1);

    return (rows ?? []).map((c) => ({
      id: c.id,
      name: c.name,
      description: c.description ?? "",
      imageUrl: c.image_url,
      inviteCode: c.invite_code,
      inviteActive: c.invite_active,
      isAdmin:
        c.owner_id === userId ||
        (memberships ?? []).some((m) => m.community_id === c.id && m.role === "admin"),
      memberCount: counts.get(c.id) ?? 0,
    }));
  });

export const createCommunity = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        name: z.string().min(2).max(80),
        description: z.string().max(500).default(""),
        imageUrl: z.string().url().max(500).nullable().default(null),
      })
      .parse(input),
  )
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    const code = Array.from({ length: 8 }, () =>
      "ABCDEFGHJKLMNPQRSTUVWXYZ23456789".charAt(Math.floor(Math.random() * 32)),
    ).join("");

    const { data: row, error } = await supabase
      .from("communities")
      .insert({
        owner_id: userId,
        name: data.name,
        description: data.description,
        image_url: data.imageUrl,
        invite_code: code,
      })
      .select("id,invite_code")
      .single();
    if (error) throw new Error(error.message);

    const { error: memberError } = await supabase
      .from("community_members")
      .insert({ community_id: row.id, user_id: userId, role: "admin" });
    if (memberError) throw new Error(memberError.message);

    return { id: row.id, inviteCode: row.invite_code };
  });

export const updateCommunity = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        id: z.string().uuid(),
        name: z.string().min(2).max(80).optional(),
        description: z.string().max(500).optional(),
        inviteActive: z.boolean().optional(),
        rotateInvite: z.boolean().optional(),
      })
      .parse(input),
  )
  .handler(async ({ context, data }) => {
    const { supabase } = context;
    const patch: {
      name?: string;
      description?: string;
      invite_active?: boolean;
      invite_code?: string;
    } = {};
    if (data.name !== undefined) patch.name = data.name;
    if (data.description !== undefined) patch.description = data.description;
    if (data.inviteActive !== undefined) patch.invite_active = data.inviteActive;
    if (data.rotateInvite) {
      patch.invite_code = Array.from({ length: 8 }, () =>
        "ABCDEFGHJKLMNPQRSTUVWXYZ23456789".charAt(Math.floor(Math.random() * 32)),
      ).join("");
    }
    // RLS restricts UPDATE to community admins.
    const { error } = await supabase.from("communities").update(patch).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteCommunity = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    const { error } = await supabase
      .from("communities")
      .delete()
      .eq("id", data.id)
      .eq("owner_id", userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/** Public-to-signed-in-users preview of an invite. Exposes only name,
 *  description and member count — never member identities. */
export const previewInvite = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ code: z.string().min(4).max(16) }).parse(input),
  )
  .handler(async ({ context, data }) => {
    const { userId } = context;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin
      .from("communities")
      .select("id,name,description,image_url,invite_active")
      .eq("invite_code", data.code.toUpperCase())
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!row || !row.invite_active) return null;

    const { count } = await supabaseAdmin
      .from("community_members")
      .select("id", { count: "exact", head: true })
      .eq("community_id", row.id);
    const { data: mine } = await supabaseAdmin
      .from("community_members")
      .select("id")
      .eq("community_id", row.id)
      .eq("user_id", userId)
      .maybeSingle();

    return {
      id: row.id,
      name: row.name,
      description: row.description ?? "",
      imageUrl: row.image_url,
      memberCount: count ?? 0,
      alreadyMember: !!mine,
    };
  });

export const joinCommunity = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ code: z.string().min(4).max(16), displayName: z.string().max(80).default("") }).parse(input),
  )
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin
      .from("communities")
      .select("id,invite_active")
      .eq("invite_code", data.code.toUpperCase())
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!row || !row.invite_active) throw new Error("Convite inválido ou encerrado.");

    // Inserted as the user (RLS: user_id must equal auth.uid()).
    const { error: joinError } = await supabase.from("community_members").upsert(
      { community_id: row.id, user_id: userId, role: "member", display_name: data.displayName },
      { onConflict: "community_id,user_id", ignoreDuplicates: true },
    );
    if (joinError) throw new Error(joinError.message);
    return { id: row.id };
  });

export const leaveCommunity = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    const { error } = await supabase
      .from("community_members")
      .delete()
      .eq("community_id", data.id)
      .eq("user_id", userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const removeMember = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ communityId: z.string().uuid(), userId: z.string().uuid() }).parse(input),
  )
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    if (data.userId === userId) throw new Error("Use 'Sair da comunidade' para remover você mesmo.");
    // RLS only lets community admins delete other people's rows.
    const { error } = await supabase
      .from("community_members")
      .delete()
      .eq("community_id", data.communityId)
      .eq("user_id", data.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/** Publishes the member's own progress snapshot. Only their own row. */
export const syncMyCommunityProgress = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        displayName: z.string().max(80).default(""),
        level: z.number().int().min(0).max(9999).default(1),
        xp: z.number().int().min(0).max(9_999_999).default(0),
        streak: z.number().int().min(0).max(9999).default(0),
        journeysCompleted: z.number().int().min(0).max(999).default(0),
        badges: z.number().int().min(0).max(999).default(0),
      })
      .parse(input),
  )
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    const { error } = await supabase
      .from("community_members")
      .update({
        display_name: data.displayName,
        level: data.level,
        xp: data.xp,
        streak: data.streak,
        journeys_completed: data.journeysCompleted,
        badges: data.badges,
      })
      .eq("user_id", userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const getCommunity = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;

    // RLS returns nothing when the caller is not a member.
    const { data: community, error } = await supabase
      .from("communities")
      .select("*")
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!community) return null;

    const [members, activities, participants, posts] = await Promise.all([
      supabase
        .from("community_members")
        .select("user_id,display_name,role,level,xp,streak,journeys_completed,badges")
        .eq("community_id", data.id)
        .order("xp", { ascending: false }),
      supabase
        .from("community_activities")
        .select("*")
        .eq("community_id", data.id)
        .order("scheduled_date", { ascending: false })
        .limit(50),
      supabase
        .from("community_activity_participants")
        .select("activity_id,user_id,status")
        .eq("community_id", data.id),
      supabase
        .from("community_posts")
        .select("*")
        .eq("community_id", data.id)
        .order("created_at", { ascending: false })
        .limit(50),
    ]);
    if (members.error) throw new Error(members.error.message);
    if (activities.error) throw new Error(activities.error.message);
    if (participants.error) throw new Error(participants.error.message);
    if (posts.error) throw new Error(posts.error.message);

    const nameOf = new Map<string, string>();
    for (const m of members.data ?? []) nameOf.set(m.user_id, m.display_name || "Membro");

    const isAdmin =
      community.owner_id === userId ||
      (members.data ?? []).some((m) => m.user_id === userId && m.role === "admin");

    return {
      community: {
        id: community.id,
        name: community.name,
        description: community.description ?? "",
        imageUrl: community.image_url,
        inviteCode: community.invite_code,
        inviteActive: community.invite_active,
        isAdmin,
        memberCount: (members.data ?? []).length,
      } satisfies CommunitySummary,
      isOwner: community.owner_id === userId,
      members: (members.data ?? []).map((m) => ({
        userId: m.user_id,
        displayName: m.display_name || "Membro",
        role: m.role as "admin" | "member",
        level: m.level,
        xp: m.xp,
        streak: m.streak,
        journeysCompleted: m.journeys_completed,
        badges: m.badges,
      })) satisfies CommunityMember[],
      activities: (activities.data ?? []).map((a) => ({
        id: a.id,
        kind: a.kind,
        title: a.title,
        description: a.description ?? "",
        scheduledDate: a.scheduled_date,
        scheduledTime: a.scheduled_time ? String(a.scheduled_time).slice(0, 5) : null,
        createdBy: a.created_by,
        participants: (participants.data ?? [])
          .filter((p) => p.activity_id === a.id)
          .map((p) => ({
            userId: p.user_id,
            displayName: nameOf.get(p.user_id) ?? "Membro",
            status: p.status as "started" | "completed",
          })),
      })) satisfies CommunityActivity[],
      posts: (posts.data ?? []).map((p) => ({
        id: p.id,
        userId: p.user_id,
        authorName: p.author_name || nameOf.get(p.user_id) || "Membro",
        kind: p.kind as "versiculo" | "palavra",
        reference: p.reference ?? "",
        content: p.content,
        createdAt: p.created_at,
      })) satisfies CommunityPost[],
    };
  });

export const createActivity = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        communityId: z.string().uuid(),
        kind: z.string().max(30).default("oracao"),
        title: z.string().min(2).max(120),
        description: z.string().max(600).default(""),
        scheduledDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        scheduledTime: z.string().regex(/^\d{2}:\d{2}$/).nullable().default(null),
      })
      .parse(input),
  )
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    const { error } = await supabase.from("community_activities").insert({
      community_id: data.communityId,
      created_by: userId,
      kind: data.kind,
      title: data.title,
      description: data.description,
      scheduled_date: data.scheduledDate,
      scheduled_time: data.scheduledTime,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteActivity = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ context, data }) => {
    const { supabase } = context;
    const { error } = await supabase.from("community_activities").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/** Joins or completes an activity. Completing also writes one real timeline
 *  event on Minha Caminhada — no XP is granted here. */
export const setActivityParticipation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        activityId: z.string().uuid(),
        communityId: z.string().uuid(),
        status: z.enum(["started", "completed"]),
        title: z.string().max(140).default(""),
      })
      .parse(input),
  )
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    const { error } = await supabase.from("community_activity_participants").upsert(
      {
        activity_id: data.activityId,
        community_id: data.communityId,
        user_id: userId,
        status: data.status,
        completed_at: data.status === "completed" ? new Date().toISOString() : null,
      },
      { onConflict: "activity_id,user_id" },
    );
    if (error) throw new Error(error.message);

    if (data.status === "completed") {
      const { error: walkError } = await supabase.from("walk_events").upsert(
        {
          user_id: userId,
          category: "oracao",
          title: `Participei de: ${data.title || "atividade da comunidade"}.`,
          detail: "Atividade em comunidade",
          icon: "🙏",
          dedupe_key: `community-activity:${data.activityId}`,
        },
        { onConflict: "user_id,dedupe_key", ignoreDuplicates: true },
      );
      if (walkError) console.error("[community] timeline event failed", walkError.message);
    }
    return { ok: true };
  });

export const createPost = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        communityId: z.string().uuid(),
        kind: z.enum(["versiculo", "palavra"]),
        reference: z.string().max(80).default(""),
        content: z.string().min(2).max(1000),
        authorName: z.string().max(80).default(""),
      })
      .parse(input),
  )
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    const { error } = await supabase.from("community_posts").insert({
      community_id: data.communityId,
      user_id: userId,
      author_name: data.authorName,
      kind: data.kind,
      reference: data.reference,
      content: data.content,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deletePost = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ context, data }) => {
    const { supabase } = context;
    const { error } = await supabase.from("community_posts").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
