<script setup>
import { reactive, ref } from "vue";
import BaseButton from "@/components/ui/BaseButton.vue";
import BaseInput from "@/components/ui/BaseInput.vue";
import BaseModal from "@/components/ui/BaseModal.vue";
import BaseSelect from "@/components/ui/BaseSelect.vue";
import MemberColorPicker from "./MemberColorPicker.vue";
import { useMembersStore } from "@/stores/members";

const props = defineProps({
  open: { type: Boolean, default: false },
});

const emit = defineEmits(["close", "invited"]);
const members = useMembersStore();
const error = ref("");
const form = reactive({
  email: "",
  role: "member",
  color: members.avatarColors[0],
});

const roles = [
  { id: "admin", label: "admin" },
  { id: "member", label: "member" },
];

async function submitInvite() {
  const result = await members.invite(form.email, form.role, form.color);
  if (!result.success) {
    error.value = members.error || "Unable to invite member.";
    return;
  }
  error.value = "";
  form.email = "";
  form.role = "member";
  form.color = members.avatarColors[0];
  emit("invited", result.member);
  emit("close");
}
</script>

<template>
  <BaseModal :open="props.open" title="Invite member" @close="$emit('close')">
    <form class="task-form" @submit.prevent="submitInvite">
      <BaseInput id="invite-modal-email" v-model="form.email" label="Email" type="email" />
      <BaseSelect id="invite-modal-role" v-model="form.role" label="Role" :options="roles" />
      <MemberColorPicker v-model="form.color" :colors="members.avatarColors" />
      <p v-if="error" class="form-error">{{ error }}</p>
      <div class="form-actions">
        <BaseButton variant="ghost" @click="$emit('close')">Cancel</BaseButton>
        <BaseButton type="submit">Invite</BaseButton>
      </div>
    </form>
  </BaseModal>
</template>
