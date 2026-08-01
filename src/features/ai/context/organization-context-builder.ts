export class OrganizationContextBuilder {
  /**
   * Compiles team organization parameters into structured XML context
   */
  static async buildPromptContext(organizationId: string, orgName: string): Promise<string> {
    return `
<organization_context>
  <organization_id>${organizationId}</organization_id>
  <name>${orgName}</name>
  <default_role>MEMBER</default_role>
  <capabilities>
    <multi_tenancy>enabled</multi_tenancy>
    <realtime_synchronization>active</realtime_synchronization>
    <workspace_roles>OWNER, ADMIN, MEMBER</workspace_roles>
  </capabilities>
</organization_context>
    `.trim();
  }
}
