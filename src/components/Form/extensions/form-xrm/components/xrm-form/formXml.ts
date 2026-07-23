export const FORM_XML = `
<form shownavigationbar="false" showImage="true">
	<tabs>
		<tab verticallayout="true" id="{56d2fc27-27b5-4b36-9d0e-f50c8d387ba7}" IsUserDefined="1" name="OverviewTab" locklevel="0" expanded="true" showlabel="true">
			<labels>
				<label description="ℹ️ Přehled" languagecode="1029" />
				<label description="ℹ️ Overview" languagecode="1033" />
			</labels>
			<columns>
				<column width="25%">
					<sections>
						<section name="InformationSection" showlabel="true" showbar="false" locklevel="0" id="{e176d9d3-5304-4e0a-a915-2ce406d1b829}" IsUserDefined="0" layout="varwidth" columns="1" labelwidth="115" celllabelalignment="Left" celllabelposition="Left">
							<labels>
								<label description="INFORMACE O SUBJEKTU" languagecode="1029" />
								<label description="ACCOUNT INFORMATION" languagecode="1033" />
							</labels>
							<rows>
								<row>
									<cell id="{1884449c-5e05-4a8b-81dc-74570d627bda}" showlabel="true" locklevel="0" visible="false">
										<labels>
											<label description="Jurisdiction Code" languagecode="1033" />
											<label description="Kód jurisdikce" languagecode="1029" />
										</labels>
										<control id="talxis_jurisdictioncode" classid="{4273EDBD-AC1D-40d3-9FB2-095C621B552D}" datafieldname="talxis_jurisdictioncode" disabled="false" />
									</cell>
								</row>
								<row>
									<cell id="{a9c03094-a269-4781-87c8-cdb7f83d83bd}" showlabel="true" locklevel="0" visible="false">
										<labels>
											<label description="Data inputed manually" languagecode="1033" />
											<label description="Data vepsána manuálně" languagecode="1029" />
										</labels>
										<control id="talxis_ismanualdata" classid="{67FAC785-CD58-4f9f-ABB3-4B7DDC6ED5ED}" datafieldname="talxis_ismanualdata" disabled="false" uniqueid="{7e04345b-06dd-464c-8fbf-9b42dbd40b83}" />
									</cell>
								</row>
								<row>
									<cell id="{c0d13698-9f6c-4afb-b279-25fa90af1ec9}" visible="false" showlabel="true" locklevel="0">
										<labels>
											<label description="Historical Names" languagecode="1033" />
											<label description="Historické názvy" languagecode="1029" />
										</labels>
										<control id="talxis_historicalnames" classid="{E0DECE4B-6FC8-4a8f-A065-082708572369}" datafieldname="talxis_historicalnames" disabled="false" uniqueid="{92668bb7-6810-487f-89a2-298ce4a53401}" />
									</cell>
								</row>
								<row>
									<cell id="{838f1ed8-7462-4ffb-acca-cebf6e40649e}" showlabel="true" locklevel="0">
										<labels>
											<label description="Account Name" languagecode="1033" />
											<label description="Název organizace" languagecode="1029" />
										</labels>
										<control id="name" classid="{4273EDBD-AC1D-40d3-9FB2-095C621B552D}" datafieldname="name" disabled="false" uniqueid="{803b4949-0c69-44a3-a348-44dbfdf23906}" />
									</cell>
								</row>
								<row>
									<cell id="{23f97f7b-bcc6-4901-824b-26f9bbe806b9}" showlabel="true" locklevel="0">
										<labels>
											<label description="Parent Account" languagecode="1033" />
											<label description="Nadřazená organizace" languagecode="1029" />
										</labels>
										<control id="parentaccountid" classid="{270BD3DB-D9AF-4782-9025-509E298DEC0A}" datafieldname="parentaccountid" disabled="false" uniqueid="{87f602a1-f303-4a40-8bcc-f976fdfe453c}">
											<parameters>
												<IsInlineNewEnabled>false</IsInlineNewEnabled>
											</parameters>
										</control>
									</cell>
								</row>
								<row>
									<cell id="{defa0eff-b940-4db4-9fe0-90a3a7f2ccbb}" showlabel="true" locklevel="0">
										<labels>
											<label description="CZ VAT Register Status" languagecode="1033" />
											<label description="Stav registrace DPH" languagecode="1029" />
										</labels>
										<control id="talxis_czvatregisterstatus" classid="{3EF39988-22BB-4f0b-BBBE-64B5A3748AEE}" datafieldname="talxis_czvatregisterstatus" disabled="true" uniqueid="{1ebdbc04-4624-4014-81e7-e734c48bfe55}" />
									</cell>
								</row>
								<row>
									<cell id="{3c807823-e08b-499f-a534-cfbf152aab8a}" showlabel="true" locklevel="0">
										<labels>
											<label description="Insolvency" languagecode="1033" />
											<label description="Insolvence" languagecode="1029" />
										</labels>
										<control id="talxis_insolvencytypecode" classid="{F9A8A302-114E-466A-B582-6771B2AE0D92}" datafieldname="talxis_insolvencytypecode" disabled="true" uniqueid="{41274b18-92bc-4c6c-aeea-39a3a9129b6f}" />
									</cell>
								</row>
								<row>
									<cell id="{5264770e-9bce-43b9-9dae-3b878d503261}" showlabel="true" locklevel="0" rowspan="5">
										<labels>
											<label description="Description" languagecode="1033" />
											<label description="Popis" languagecode="1029" />
										</labels>
										<control id="description" classid="{E0DECE4B-6FC8-4a8f-A065-082708572369}" datafieldname="description" disabled="false" uniqueid="{4535e2df-1733-4306-b620-bca24cc6c082}" />
									</cell>
								</row>
								<row>
									<cell id="{6961caae-0f93-426c-a409-9d438c9787da}" locklevel="0" colspan="1" rowspan="1" showlabel="true" labelid="{b19e25d1-4fe0-47c3-b431-da960d89b757}">
										<labels>
											<label description="Do not synchronise to ISOH-KLI" languagecode="1033" />
											<label description="Nesynchronizovat do ISOH-KLI" languagecode="1029" />
										</labels>
										<control id="ntg_blockisohsynctypecode" classid="{67FAC785-CD58-4f9f-ABB3-4B7DDC6ED5ED}" datafieldname="ntg_blockisohsynctypecode" />
									</cell>
								</row>
								<row />
								<row />
								<row />
								<row />
							</rows>
						</section>
						<section name="seataddresssection" showlabel="true" showbar="false" locklevel="0" id="{b8b2885c-484f-405a-b46f-d0ce18d22bde}" IsUserDefined="0" layout="varwidth" columns="1" labelwidth="115" celllabelalignment="Left" celllabelposition="Left">
							<labels>
								<label description="SÍDLO" languagecode="1029" />
								<label description="SEAT ADDRESS" languagecode="1033" />
							</labels>
							<rows>
								<row>
									<cell id="{0b2c7fca-a510-44b4-b9b6-a7740491efea}" locklevel="0" showlabel="false">
										<labels>
											<label description="Seat Address" languagecode="1033" />
											<label description="Adresa sídla" languagecode="1029" />
										</labels>
										<control id="talxis_seataddressid" classid="{270BD3DB-D9AF-4782-9025-509E298DEC0A}" datafieldname="talxis_seataddressid" disabled="false" uniqueid="{5506adcc-6593-409e-b9b6-1f0ed388fef9}" />
									</cell>
								</row>
							</rows>
						</section>
						<section name="mailingaddresssection" showlabel="true" showbar="false" locklevel="0" id="{c4f346ee-5b2b-449d-84e1-cf5de6f03b80}" IsUserDefined="0" layout="varwidth" columns="1" labelwidth="115" celllabelalignment="Left" celllabelposition="Left">
							<labels>
								<label description="KORESPONDENČNÍ ADRESA" languagecode="1029" />
								<label description="MAIL ADDRESS" languagecode="1033" />
							</labels>
							<rows>
								<row>
									<cell id="{7670cc76-e79f-493f-9dee-a927480e593c}" locklevel="0" showlabel="false">
										<labels>
											<label description="Mail Address" languagecode="1033" />
											<label description="Korespondenčni adresa" languagecode="1029" />
										</labels>
										<control id="talxis_mailaddressid" classid="{270BD3DB-D9AF-4782-9025-509E298DEC0A}" datafieldname="talxis_mailaddressid" disabled="false" uniqueid="{e9b885dd-cfb0-4ffa-8913-46e3293fb58d}" />
									</cell>
								</row>
							</rows>
						</section>
						<section name="contactsection" showlabel="true" showbar="false" locklevel="0" id="{075d4c3d-79f8-4e27-8dd7-e3da2f9dc394}" IsUserDefined="0" layout="varwidth" columns="1" labelwidth="115" celllabelalignment="Left" celllabelposition="Left">
							<labels>
								<label description="KONTAKT" languagecode="1029" />
								<label description="CONTACT" languagecode="1033" />
							</labels>
							<rows>
								<row>
									<cell id="{b8f7957e-48bd-4255-8604-92282fd948ea}" showlabel="true" locklevel="0" labelid="{4d3d7c64-34e3-4414-96a9-36dbedc69ab9}">
										<labels>
											<label description="Primary Contact" languagecode="1033" />
											<label description="Kontaktní osoba" languagecode="1029" />
										</labels>
										<control id="primarycontactid" classid="{270BD3DB-D9AF-4782-9025-509E298DEC0A}" datafieldname="primarycontactid" disabled="false" uniqueid="{302744d3-9248-49df-8552-8e2ee047ca01}">
											<parameters>
												<AutoResolve>true</AutoResolve>
												<DisableMru>false</DisableMru>
												<DisableQuickFind>false</DisableQuickFind>
												<DisableViewPicker>false</DisableViewPicker>
												<DefaultViewId>{A2D479C5-53E3-4C69-ADDD-802327E67A0D}</DefaultViewId>
												<AllowFilterOff>false</AllowFilterOff>
											</parameters>
										</control>
									</cell>
								</row>
								<row>
									<cell id="{24902473-5de8-4c38-b97f-a6d7f1f75617}" showlabel="true" locklevel="0">
										<labels>
											<label description="Contact Person Type" languagecode="1033" />
											<label description="Typ kontaktní osoby" languagecode="1029" />
										</labels>
										<control id="ntg_contactpersonmultitypecode" classid="{4AA28AB7-9C13-4F57-A73D-AD894D048B5F}" datafieldname="ntg_contactpersonmultitypecode" disabled="false" uniqueid="{0fb6b421-a09d-4468-a332-523831cdffc8}" />
									</cell>
								</row>
								<row>
									<cell id="{91d90949-2ce2-48df-aa62-954bb2430d03}" showlabel="true" locklevel="0">
										<labels>
											<label description="Main Email" languagecode="1033" />
											<label description="Email organizace" languagecode="1029" />
										</labels>
										<control id="talxis_emailaddress1" classid="{F9A8A302-114E-466A-B582-6771B2AE0D92}" datafieldname="talxis_emailaddress1" disabled="false" uniqueid="{681bf1e4-9b93-457c-90fa-8390c61cd78f}" />
									</cell>
								</row>
								<row>
									<cell id="{7faabc41-8545-44c8-b89e-6c520bda4de7}" showlabel="true" locklevel="0">
										<labels>
											<label description="Main Phone" languagecode="1033" />
											<label description="Telefonní číslo organizace" languagecode="1029" />
										</labels>
										<control id="talxis_phonenumber1" classid="{F9A8A302-114E-466A-B582-6771B2AE0D92}" datafieldname="talxis_phonenumber1" disabled="false" uniqueid="{fda91d22-674b-42c2-a3a7-4e31b9013f2f}" />
									</cell>
								</row>
								<row>
									<cell id="{04325ea6-3193-4c66-83d6-afd8d0ca7ad4}" showlabel="true" locklevel="0">
										<labels>
											<label description="Web Site" languagecode="1033" />
											<label description="Webová stránka" languagecode="1029" />
										</labels>
										<control id="websiteurl" classid="{4273EDBD-AC1D-40d3-9FB2-095C621B552D}" datafieldname="websiteurl" disabled="false" uniqueid="{447d0dd2-6f6b-4732-9cbd-7bc47d181618}" />
									</cell>
								</row>
								<row>
									<cell id="{19a2935a-cf7e-4af0-a469-b59e8c2a2ded}" showlabel="true" locklevel="0">
										<labels>
											<label description="E-shop Web Site" languagecode="1033" />
											<label description="Webová stránka e-shopu" languagecode="1029" />
										</labels>
										<control id="ntg_eshopwebsiteurl" classid="{4273EDBD-AC1D-40d3-9FB2-095C621B552D}" datafieldname="ntg_eshopwebsiteurl" disabled="false" uniqueid="{66f7d318-8245-458c-88a8-3f19d9a103a9}" />
									</cell>
								</row>
								<row>
									<cell id="{29dd7d8a-9007-42a0-989c-22969257319f}" showlabel="true" locklevel="0">
										<labels>
											<label description="Data Box Id" languagecode="1033" />
											<label description="Id datové schránky" languagecode="1029" />
										</labels>
										<control id="ntg_databoxid" classid="{4273EDBD-AC1D-40d3-9FB2-095C621B552D}" datafieldname="ntg_databoxid" disabled="false" uniqueid="{93e3e4b1-7757-4e60-924b-a91a9043072a}" />
									</cell>
								</row>
							</rows>
						</section>
					</sections>
				</column>
				<column width="50%">
					<sections>
						<section name="TimelineSection" showlabel="true" showbar="false" locklevel="0" id="{d3f15d4c-e542-41f5-aa50-4ec3797b39d7}" IsUserDefined="0" layout="varwidth" columns="1" labelwidth="115" celllabelalignment="Left" celllabelposition="Left">
							<labels>
								<label description="ČASOVÁ OSA" languagecode="1029" />
								<label description="TIMELINE" languagecode="1033" />
							</labels>
							<rows>
								<row>
									<cell id="{b6534737-4a00-4caa-a3d3-83783246186f}" locklevel="0" colspan="1" rowspan="1" showlabel="false">
										<labels>
											<label description="Timeline Control PCF" languagecode="1033" />
											<label description="Timeline Control PCF" languagecode="1029" />
										</labels>
										<control id="talxis_timelinecontrolpcf" classid="{F9A8A302-114E-466A-B582-6771B2AE0D92}" datafieldname="talxis_timelinecontrolpcf" disabled="false" uniqueid="{9259e1fe-3fdf-4da9-8bfa-e412d3d4ead2}" />
									</cell>
								</row>
							</rows>
						</section>
					</sections>
				</column>
				<column width="25%">
					<sections>
						<section name="RelationshipSection" showlabel="true" showbar="false" locklevel="0" id="{9b1ee3bd-99b3-492c-b8d9-a90de9042e55}" IsUserDefined="0" layout="varwidth" columns="1" labelwidth="115" celllabelalignment="Left" celllabelposition="Left">
							<labels>
								<label description="VZTAHY" languagecode="1029" />
								<label description="RELATIONSHIPS" languagecode="1033" />
							</labels>
							<rows>
								<row>
									<cell id="{3f183f62-6599-48ba-be3b-1d07b5039b67}" showlabel="false" locklevel="0">
										<labels>
											<label description="Relationships" languagecode="1033" />
										</labels>
										<control id="ntg_relationshippcf" classid="{4AA28AB7-9C13-4F57-A73D-AD894D048B5F}" datafieldname="ntg_relationshippcf" uniqueid="{9e3e26b6-8c23-493c-9d44-46c4dff37817}" />
									</cell>
								</row>
							</rows>
						</section>
						<section name="authorizationsection" id="{4e6b4efc-6e64-4c2f-b15b-fa45f269d2ab}" IsUserDefined="0" locklevel="0" showlabel="true" showbar="false" layout="varwidth" celllabelalignment="Left" celllabelposition="Left" columns="1" labelwidth="115">
							<labels>
								<label description="AUTORIZACE" languagecode="1029" />
								<label description="AUTHORIZATION" languagecode="1033" />
							</labels>
							<rows>
								<row>
									<cell locklevel="0" id="{e092cb45-1808-48ee-a0e7-1231c1da7fea}" rowspan="4" colspan="1" auto="false" showlabel="false">
										<labels>
											<label description="Account Authorizations" languagecode="1033" />
											<label description="Autorizace organizace" languagecode="1029" />
										</labels>
										<control indicationOfSubgrid="true" id="ntg_accountauthorization" classid="{E7A81278-8635-4D9E-8D4D-59480B391C5B}" uniqueid="{1713d6c1-8e3c-467d-a94d-4b97ee8cf52a}">
											<parameters>
												<RecordsPerPage>4</RecordsPerPage>
												<AutoExpand>Fixed</AutoExpand>
												<EnableQuickFind>false</EnableQuickFind>
												<EnableViewPicker>false</EnableViewPicker>
												<EnableChartPicker>true</EnableChartPicker>
												<ChartGridMode>All</ChartGridMode>
												<TargetEntityType>ntg_accountauthorization</TargetEntityType>
												<ViewId>{8faa70a4-4cbb-4559-b24a-cd4e9e345f8f}</ViewId>
												<ViewIds>{8faa70a4-4cbb-4559-b24a-cd4e9e345f8f}</ViewIds>
												<RelationshipName>ntg_account_ntg_accountauthorization_accountid</RelationshipName>
											</parameters>
										</control>
									</cell>
								</row>
								<row />
								<row />
								<row />
							</rows>
						</section>
					</sections>
				</column>
			</columns>
		</tab>
		<tab name="detailtab" id="{9d939436-2681-41b9-828c-538e87bb6df4}" IsUserDefined="0" locklevel="0" showlabel="true">
			<labels>
				<label description="🔍 Detail" languagecode="1029" />
				<label description="🔍 Detail" languagecode="1033" />
			</labels>
			<columns>
				<column width="25%">
					<sections>
						<section name="identificationsection" id="{0daa15ba-a817-4ed7-a214-8c5e267c534d}" IsUserDefined="0" locklevel="0" showlabel="true" showbar="false" layout="varwidth" celllabelalignment="Left" celllabelposition="Left" columns="1" labelwidth="115">
							<labels>
								<label description="IDENTIFIKACE" languagecode="1029" />
								<label description="IDENTIFICATION INFORMATION" languagecode="1033" />
							</labels>
							<rows>
								<row>
									<cell id="{252299ad-0842-488f-a6ce-a0003f579cef}" showlabel="true" locklevel="0">
										<labels>
											<label description="National Identification Number" languagecode="1033" />
											<label description="IČ" languagecode="1029" />
										</labels>
										<control id="talxis_nationalidentificationnumber" classid="{4273EDBD-AC1D-40d3-9FB2-095C621B552D}" datafieldname="talxis_nationalidentificationnumber" disabled="true" />
									</cell>
								</row>
								<row>
									<cell id="{f1ac308d-0ffc-4586-8fce-baabf2422169}" showlabel="true" locklevel="0">
										<labels>
											<label description="Tax Identification Number" languagecode="1033" />
											<label description="DIČ" languagecode="1029" />
										</labels>
										<control id="talxis_taxidentificationnumber" classid="{4273EDBD-AC1D-40d3-9FB2-095C621B552D}" datafieldname="talxis_taxidentificationnumber" disabled="true" />
									</cell>
								</row>
							</rows>
						</section>
						<section name="aditionalinformationssection" id="{58a00d56-c847-4d46-8dbc-c556477e5087}" IsUserDefined="0" locklevel="0" showlabel="true" showbar="false" layout="varwidth" celllabelalignment="Left" celllabelposition="Left" columns="1" labelwidth="115">
							<labels>
								<label description="DOPLŇUJÍCÍ INFORMACE" languagecode="1029" />
								<label description="ADDITIONAL INFORMATION" languagecode="1033" />
							</labels>
							<rows>
								<row>
									<cell id="{d8dadcd4-bdc2-d399-2461-a79ee0d73ae8}" showlabel="true" locklevel="0">
										<labels>
											<label description="Created On" languagecode="1033" />
											<label description="Vytvořeno" languagecode="1029" />
										</labels>
										<control id="ntg_createdon" classid="{5B773807-9FB2-42db-97C3-7A91EFF8ADFF}" datafieldname="ntg_createdon" disabled="false" />
									</cell>
								</row>
								<row>
									<cell id="{96a2d29a-a951-4dc9-b141-1fcb1d8bd78c}" showlabel="true" locklevel="0">
										<labels>
											<label description="Registration Court" languagecode="1033" />
											<label description="Registrováno u soudu" languagecode="1029" />
										</labels>
										<control id="talxis_registrationcourt" classid="{4273EDBD-AC1D-40d3-9FB2-095C621B552D}" datafieldname="talxis_registrationcourt" disabled="true" />
									</cell>
								</row>
								<row>
									<cell id="{376375dc-6b2f-4de5-98ae-3475dcf9697e}" showlabel="true" locklevel="0">
										<labels>
											<label description="Date Established" languagecode="1033" />
											<label description="Datum založení" languagecode="1029" />
										</labels>
										<control id="talxis_dateestablished" classid="{5B773807-9FB2-42DB-97C3-7A91EFF8ADFF}" datafieldname="talxis_dateestablished" disabled="true" />
									</cell>
								</row>
								<row>
									<cell id="{9e0195d0-54cd-47ec-808a-79e9480d24ea}" showlabel="true" locklevel="0">
										<labels>
											<label description="Annual Revenue" languagecode="1033" />
											<label description="Roční obrat" languagecode="1029" />
										</labels>
										<control id="revenue" classid="{533B9E00-756B-4312-95A0-DC888637AC78}" datafieldname="revenue" />
									</cell>
								</row>
								<row>
									<cell id="{95199ee8-6eca-45cb-b1ad-f9dffc60a725}" showlabel="true" locklevel="0">
										<labels>
											<label description="No. of Employees" languagecode="1033" />
											<label description="Počet zaměstnanců" languagecode="1029" />
										</labels>
										<control id="numberofemployees" classid="{C6D124CA-7EDA-4a60-AEA9-7FB8D318B68F}" datafieldname="numberofemployees" />
									</cell>
								</row>
							</rows>
						</section>
						<section name="slasection" id="{e9f96fd6-91a6-4632-8b7a-82e16fee2ae4}" IsUserDefined="0" locklevel="0" showlabel="true" showbar="false" layout="varwidth" celllabelalignment="Left" celllabelposition="Left" columns="1" labelwidth="115">
							<labels>
								<label description="SLA KONFIGURACE OBJ" languagecode="1029" />
								<label description="WASTE COLLECTION ORDER SLA CONFIGURATION" languagecode="1033" />
							</labels>
							<rows>
								<row>
									<cell id="{bea89ae0-dcd8-47cc-9b37-786fffd061ec}" locklevel="0" colspan="1" rowspan="1" showlabel="true" labelid="{bd4ee4dd-77e3-498a-b278-f84e586ec9e8}">
										<labels>
											<label description="Time to first response" languagecode="1033" />
											<label description="Dnů do první odpovědi zbývá" languagecode="1029" />
										</labels>
										<control id="ntg_slafirstresponsedaysremaining" classid="{C6D124CA-7EDA-4a60-AEA9-7FB8D318B68F}" datafieldname="ntg_slafirstresponsedaysremaining" disabled="false" />
									</cell>
								</row>
								<row>
									<cell id="{eb539253-3ae9-4a26-afcb-55a2ebb3c271}" locklevel="0" colspan="1" rowspan="1" showlabel="true" labelid="{fabb8f2e-dd86-4c31-ab83-fbea34250741}">
										<labels>
											<label description="Days to completition remaining" languagecode="1033" />
											<label description="Dnů do zpracování zbývá" languagecode="1029" />
										</labels>
										<control id="ntg_sladaysremaining" classid="{C6D124CA-7EDA-4a60-AEA9-7FB8D318B68F}" datafieldname="ntg_sladaysremaining" disabled="false" />
									</cell>
								</row>
							</rows>
						</section>
					</sections>
				</column>
				<column width="50%">
					<sections>
						<section name="EconomicClassificationSection" showlabel="true" showbar="false" locklevel="0" id="{791bb53b-0f6c-42e1-bd33-ba4467dc17b3}" IsUserDefined="0" layout="varwidth" columns="1" labelwidth="115" celllabelalignment="Left" celllabelposition="Left">
							<labels>
								<label description="EKONOMICKÁ KLASIFIKACE" languagecode="1029" />
								<label description="ECONOMIC CLASSIFICATION" languagecode="1033" />
							</labels>
							<rows>
								<row>
									<cell id="{5e493a1d-1c21-46de-ab39-ea838c4298ad}" showlabel="false" colspan="1" auto="false" rowspan="12">
										<labels>
											<label description="Classification of Economic Activities" languagecode="1033" />
											<label description="Klasifikace ekonomických aktivit" languagecode="1029" />
										</labels>
										<control id="ClassificationOfEconomicActivities" classid="{E7A81278-8635-4d9e-8D4D-59480B391C5B}" indicationOfSubgrid="true" uniqueid="{a3360d87-f2bf-4f49-8997-206a2f9b3bb4}">
											<parameters>
												<ViewId>{2F5FD0E7-5B17-EA11-A811-000D3A4B2C9E}</ViewId>
												<IsUserView>false</IsUserView>
												<RelationshipName>talxis_coea_account</RelationshipName>
												<TargetEntityType>talxis_classificationofeconomicactivities</TargetEntityType>
												<AutoExpand>Fixed</AutoExpand>
												<EnableQuickFind>false</EnableQuickFind>
												<EnableViewPicker>false</EnableViewPicker>
												<ViewIds>{2F5FD0E7-5B17-EA11-A811-000D3A4B2C9E}</ViewIds>
												<EnableJumpBar>false</EnableJumpBar>
												<ChartGridMode>All</ChartGridMode>
												<VisualizationId />
												<IsUserChart>false</IsUserChart>
												<EnableChartPicker>true</EnableChartPicker>
												<RecordsPerPage>10</RecordsPerPage>
												<HeaderColorCode>#F3F3F3</HeaderColorCode>
												<RelationshipRoleOrdinal>2</RelationshipRoleOrdinal>
											</parameters>
										</control>
									</cell>
								</row>
							</rows>
						</section>
					</sections>
				</column>
				<column width="25%">
					<sections>
						<section name="BankaccountsSection" id="{f74f0198-5d86-41fe-a9ca-43ec8e019a8e}" IsUserDefined="0" locklevel="0" showlabel="true" showbar="false" layout="varwidth" celllabelalignment="Left" celllabelposition="Left" columns="1" labelwidth="115">
							<labels>
								<label description="BANKOVNÍ ÚČTY" languagecode="1029" />
								<label description="BANK ACCOUNTS" languagecode="1033" />
							</labels>
							<rows>
								<row>
									<cell id="{2432ff75-01da-432f-ba12-ee0c04a3c0b8}" locklevel="0" auto="true">
										<labels>
											<label description="Main" languagecode="1033" />
											<label description="Hlavní" languagecode="1029" />
										</labels>
										<control id="talxis_czpublishedvatbankaccounts" classid="{E0DECE4B-6FC8-4a8f-A065-082708572369}" datafieldname="talxis_czpublishedvatbankaccounts" disabled="false" />
									</cell>
								</row>
							</rows>
						</section>
						<section name="revenuesection" id="{54d6b3e5-c1c5-476d-a08f-e3d6bd29bab0}" IsUserDefined="0" locklevel="0" showlabel="true" showbar="false" layout="varwidth" celllabelalignment="Left" celllabelposition="Left" columns="1" labelwidth="115">
							<labels>
								<label description="HRUBÝ PŘÍJEM" languagecode="1029" />
								<label description="GROSS REVENUE" languagecode="1033" />
							</labels>
							<rows>
								<row>
									<cell id="{3e2f56a8-7937-4d24-bf0a-838176f55a7a}" locklevel="0">
										<labels>
											<label description="Year" languagecode="1033" />
											<label description="Rok" languagecode="1029" />
										</labels>
										<control id="talxis_grossrevenuefromyear" classid="{4273EDBD-AC1D-40D3-9FB2-095C621B552D}" datafieldname="talxis_grossrevenuefromyear" disabled="true" />
									</cell>
								</row>
								<row>
									<cell id="{e5260208-ea43-4617-a74f-ba964a469764}" locklevel="0">
										<labels>
											<label description="Lower Bound" languagecode="1033" />
											<label description="Dolní hranice" languagecode="1029" />
										</labels>
										<control id="talxis_grossrevenuelowerbound" classid="{533B9E00-756B-4312-95A0-DC888637AC78}" datafieldname="talxis_grossrevenuelowerbound" disabled="true" />
									</cell>
								</row>
								<row>
									<cell id="{e1b145ab-7f30-4ba1-b3ac-cdee221ed297}" locklevel="0">
										<labels>
											<label description="Upper Bound" languagecode="1033" />
											<label description="Horní hranice" languagecode="1029" />
										</labels>
										<control id="talxis_grossrevenueupperbound" classid="{533B9E00-756B-4312-95A0-DC888637AC78}" datafieldname="talxis_grossrevenueupperbound" disabled="true" />
									</cell>
								</row>
							</rows>
						</section>
					</sections>
				</column>
			</columns>
		</tab>
		<tab name="ContactsTab" id="{1c03e94e-dfac-46e9-9ea3-164deff894e4}" IsUserDefined="0" locklevel="0" showlabel="true" expanded="true">
			<labels>
				<label description="☎️ Osoby" languagecode="1029" />
				<label description="☎️ People" languagecode="1033" />
			</labels>
			<columns>
				<column width="100%">
					<sections>
						<section name="ContactsSection" showlabel="true" showbar="false" locklevel="0" id="{cd4941b9-5313-4c57-a3f4-eadc8d716cdb}" IsUserDefined="0" layout="varwidth" columns="1" labelwidth="115" celllabelalignment="Left" celllabelposition="Left">
							<labels>
								<label description="KONTAKTY" languagecode="1029" />
								<label description="CONTACTS" languagecode="1033" />
							</labels>
							<rows>
								<row>
									<cell id="{3a761a71-c920-4098-980b-61c0d11dfeac}" locklevel="0" colspan="1" rowspan="1" showlabel="false">
										<labels>
											<label description="People Picker PCF" languagecode="1033" />
											<label description="People Picker PCF" languagecode="1029" />
										</labels>
										<control id="talxis_peoplegridpcf" classid="{F9A8A302-114E-466A-B582-6771B2AE0D92}" datafieldname="talxis_peoplegridpcf" disabled="false" uniqueid="{b69999f8-6809-4b96-9d73-8dc0b1b1868e}" />
									</cell>
								</row>
								<row />
								<row />
								<row />
								<row />
								<row />
								<row />
								<row />
								<row />
								<row />
								<row />
								<row />
							</rows>
						</section>
					</sections>
				</column>
			</columns>
		</tab>
		<tab name="sitestab" id="{63a3741c-643d-4898-b4e7-d887d6d201ac}" IsUserDefined="0" locklevel="0" showlabel="true">
			<labels>
				<label description="🏬 Provozovny" languagecode="1029" />
				<label description="🏬 Sites" languagecode="1033" />
			</labels>
			<columns>
				<column width="100%">
					<sections>
						<section name="sitesection" id="{0237c54c-f67c-4b6b-afa0-a19648e8f646}" IsUserDefined="0" locklevel="0" showlabel="true" showbar="false" layout="varwidth" celllabelalignment="Left" celllabelposition="Left" columns="1" labelwidth="115">
							<labels>
								<label description="PROVOZOVNY" languagecode="1029" />
								<label description="SITES" languagecode="1033" />
							</labels>
							<rows>
								<row>
									<cell locklevel="0" id="{f5b9e1ee-b077-44ed-9177-f98157ed2ebb}" showlabel="false" rowspan="4" colspan="1" auto="false">
										<labels>
											<label description="Sites" languagecode="1033" />
											<label description="Provozovny" languagecode="1029" />
										</labels>
										<control indicationOfSubgrid="true" id="sitessubgrid" classid="{E7A81278-8635-4D9E-8D4D-59480B391C5B}" uniqueid="{c2ea0fe7-683f-4443-a9af-63e85429d58b}">
											<parameters>
												<RecordsPerPage>100</RecordsPerPage>
												<AutoExpand>Fixed</AutoExpand>
												<EnableQuickFind>false</EnableQuickFind>
												<EnableViewPicker>false</EnableViewPicker>
												<EnableChartPicker>true</EnableChartPicker>
												<ChartGridMode>All</ChartGridMode>
												<TargetEntityType>talxis_site</TargetEntityType>
												<ViewId>{15f19826-331f-44f1-8e62-65b08aa7fd84}</ViewId>
												<ViewIds>{15f19826-331f-44f1-8e62-65b08aa7fd84}</ViewIds>
												<RelationshipName>talxis_account_talxis_site_accountid</RelationshipName>
											</parameters>
										</control>
									</cell>
								</row>
								<row />
								<row />
								<row />
							</rows>
						</section>
					</sections>
				</column>
			</columns>
		</tab>
		<tab name="FileTab" id="{8e55d0d1-93b3-402d-a5c5-742298fec126}" IsUserDefined="0" locklevel="0" showlabel="true">
			<labels>
				<label description="🗃️ Soubory" languagecode="1029" />
				<label description="🗃️ Files" languagecode="1033" />
			</labels>
			<columns>
				<column width="100%">
					<sections>
						<section name="filesection" id="{d6a3aa3a-c8d1-4337-97fb-ec5db9930f2c}" IsUserDefined="0" locklevel="0" showlabel="true" showbar="false" layout="varwidth" celllabelalignment="Left" celllabelposition="Left" columns="1" labelwidth="115">
							<labels>
								<label description="SOUBORY" languagecode="1029" />
								<label description="FILES" languagecode="1033" />
							</labels>
							<rows>
								<row>
									<cell id="{99938eb5-50c9-4055-a8d3-eab61ace2c4d}" locklevel="0" colspan="1" rowspan="1" showlabel="false" visible="false">
										<labels>
											<label description="Account ID" languagecode="1033" />
											<label description="Obchodní vztah" languagecode="1029" />
										</labels>
										<control id="accountid" classid="{4273EDBD-AC1D-40d3-9FB2-095C621B552D}" datafieldname="accountid" disabled="false" uniqueid="{4d15758e-63fd-4ea3-a8fe-19795a174c77}" />
									</cell>
								</row>
								<row>
									<cell id="{27413d62-1a4f-448e-943e-4475ab59a4e3}" locklevel="0" colspan="1" rowspan="1" showlabel="false">
										<labels>
											<label description="File Control" languagecode="1033" />
											<label description="Soubory" languagecode="1029" />
										</labels>
										<control id="talxis_filecontrol" classid="{F9A8A302-114E-466A-B582-6771B2AE0D92}" datafieldname="talxis_filecontrol" disabled="false" uniqueid="{5fe0b020-b212-4501-a439-1cd347a52271}" />
									</cell>
								</row>
							</rows>
						</section>
					</sections>
				</column>
			</columns>
		</tab>
		<tab name="contractstab" id="{08effe05-87a1-4aed-aaff-487ddee28dff}" IsUserDefined="0" locklevel="0" showlabel="true">
			<labels>
				<label description="📝 Smlouvy" languagecode="1029" />
				<label description="📝 Contracts" languagecode="1033" />
			</labels>
			<columns>
				<column width="100%">
					<sections>
						<section name="contractssection" id="{a9462640-997b-4e48-b0d7-0c9040c97778}" IsUserDefined="0" locklevel="0" showlabel="true" showbar="false" layout="varwidth" celllabelalignment="Left" celllabelposition="Left" columns="1" labelwidth="115">
							<labels>
								<label description="SMLOUVY" languagecode="1029" />
								<label description="CONTRACTS" languagecode="1033" />
							</labels>
							<rows>
								<row>
									<cell locklevel="0" id="{33db22eb-32f0-44f0-a870-7d2b4aa98abf}" showlabel="false" rowspan="12" colspan="1" auto="false">
										<labels>
											<label description="Contracts" languagecode="1033" />
											<label description="Smlouvy" languagecode="1029" />
										</labels>
										<control indicationOfSubgrid="true" id="contractssubgrid" classid="{E7A81278-8635-4D9E-8D4D-59480B391C5B}" uniqueid="{1fb47222-9823-4e14-bd71-59e8c45ddd1e}">
											<parameters>
												<RecordsPerPage>100</RecordsPerPage>
												<AutoExpand>Fixed</AutoExpand>
												<EnableQuickFind>false</EnableQuickFind>
												<EnableViewPicker>false</EnableViewPicker>
												<EnableChartPicker>true</EnableChartPicker>
												<ChartGridMode>All</ChartGridMode>
												<TargetEntityType>talxis_contract</TargetEntityType>
												<ViewId>{b3ca8f77-446b-4917-975c-140bab1eda49}</ViewId>
												<ViewIds>{b3ca8f77-446b-4917-975c-140bab1eda49}</ViewIds>
												<RelationshipName>talxis_account_talxis_contract_counterpartyid</RelationshipName>
											</parameters>
										</control>
									</cell>
								</row>
								<row />
								<row />
								<row />
								<row />
								<row />
								<row />
								<row />
								<row />
								<row />
								<row />
								<row />
								<row />
							</rows>
						</section>
						<section name="amendmentssection" id="{f7b1cdcd-6c7c-4259-8ebc-8b392095f2ce}" IsUserDefined="0" locklevel="0" showlabel="true" showbar="false" layout="varwidth" celllabelalignment="Left" celllabelposition="Left" columns="1" labelwidth="115">
							<labels>
								<label description="DODATKY" languagecode="1029" />
								<label description="AMENDMENTS" languagecode="1033" />
							</labels>
							<rows>
								<row>
									<cell locklevel="0" id="{b418e8a0-0d89-4265-81b9-cfeccf28e76c}" showlabel="false" rowspan="12" colspan="1" auto="false">
										<labels>
											<label description="Amendments" languagecode="1033" />
											<label description="Dodatky" languagecode="1029" />
										</labels>
										<control indicationOfSubgrid="true" id="amendmentssubgrid" classid="{E7A81278-8635-4D9E-8D4D-59480B391C5B}" uniqueid="{05d9296f-5206-41cd-83df-c175b029a13f}">
											<parameters>
												<RecordsPerPage>100</RecordsPerPage>
												<AutoExpand>Fixed</AutoExpand>
												<EnableQuickFind>false</EnableQuickFind>
												<EnableViewPicker>false</EnableViewPicker>
												<EnableChartPicker>true</EnableChartPicker>
												<ChartGridMode>All</ChartGridMode>
												<TargetEntityType>talxis_contract</TargetEntityType>
												<ViewId>{56768854-b92e-4f6b-892b-a7701715bd83}</ViewId>
												<ViewIds>{56768854-b92e-4f6b-892b-a7701715bd83}</ViewIds>
												<RelationshipName>talxis_account_talxis_contract_counterpartyid</RelationshipName>
											</parameters>
										</control>
									</cell>
								</row>
							</rows>
						</section>
					</sections>
				</column>
			</columns>
		</tab>
		<tab name="orderstab" id="1abad3f7-796d-4fd8-952f-b78cda2c8788" IsUserDefined="0" locklevel="0" showlabel="true">
			<labels>
				<label description="📦 Objednávky" languagecode="1029" />
				<label description="📦 Orders" languagecode="1033" />
			</labels>
			<columns>
				<column width="100%">
					<sections>
						<section name="ordersection" id="a2dbe882-1d2e-4077-b32d-b853c6c45194" IsUserDefined="0" locklevel="0" showlabel="true" showbar="false" layout="varwidth" celllabelalignment="Left" celllabelposition="Left" columns="1" labelwidth="115">
							<labels>
								<label description="OBJEDNÁVKY" languagecode="1029" />
								<label description="ORDERS" languagecode="1033" />
							</labels>
							<rows>
								<row />
								<row>
									<cell locklevel="0" id="{0c776841-f700-4ba2-8ab3-a138b53fe744}" rowspan="4" colspan="1" auto="false" showlabel="false">
										<labels>
											<label description="ORDERS" languagecode="1033" />
											<label description="OBJEDNÁVKY" languagecode="1029" />
										</labels>
										<control indicationOfSubgrid="true" id="ordersubgrid" classid="{E7A81278-8635-4D9E-8D4D-59480B391C5B}">
											<parameters>
												<RecordsPerPage>100</RecordsPerPage>
												<AutoExpand>Fixed</AutoExpand>
												<EnableQuickFind>false</EnableQuickFind>
												<EnableViewPicker>false</EnableViewPicker>
												<EnableChartPicker>true</EnableChartPicker>
												<ChartGridMode>All</ChartGridMode>
												<TargetEntityType>ntg_wastecollectionorderheader</TargetEntityType>
												<ViewId>{a53e340b-8184-ee11-8179-000d3a2acf67}</ViewId>
												<ViewIds>{a53e340b-8184-ee11-8179-000d3a2acf67}</ViewIds>
												<RelationshipName>ntg_account_ntg_wastecollectionorderheader_customerid</RelationshipName>
											</parameters>
										</control>
									</cell>
								</row>
								<row />
								<row />
								<row />
							</rows>
						</section>
					</sections>
				</column>
			</columns>
		</tab>
		<tab name="tab_audit" id="0d559bc3-2e40-4e0c-b657-eb34aa93aced" IsUserDefined="0" locklevel="0" showlabel="true">
			<labels>
				<label description="🕵 Audit" languagecode="1029" />
				<label description="🕵 Audit" languagecode="1033" />
			</labels>
			<columns>
				<column width="100%">
					<sections>
						<section name="tab_audit_section_auditgrid" id="9d014497-5747-4c45-a02b-63026e7c2270" IsUserDefined="0" locklevel="0" showlabel="true" showbar="false" layout="varwidth" celllabelalignment="Left" celllabelposition="Left" columns="1">
							<labels>
								<label description="AUDITY" languagecode="1029" />
								<label description="AUDITS" languagecode="1033" />
							</labels>
							<rows>
								<row>
									<cell locklevel="0" id="{ed823d7f-7447-43ef-b48d-58c68b270efe}" rowspan="4" colspan="1" auto="false" showlabel="false">
										<labels>
											<label description="Audits" languagecode="1033" />
											<label description="Audity" languagecode="1029" />
										</labels>
										<control indicationOfSubgrid="true" id="ntg_audit_subgrid" classid="{E7A81278-8635-4D9E-8D4D-59480B391C5B}" uniqueid="{f3cf869f-5ab6-41ff-b402-a03bfe50bdbb}">
											<parameters>
												<RecordsPerPage>100</RecordsPerPage>
												<AutoExpand>Fixed</AutoExpand>
												<EnableQuickFind>false</EnableQuickFind>
												<EnableViewPicker>false</EnableViewPicker>
												<EnableChartPicker>true</EnableChartPicker>
												<ChartGridMode>All</ChartGridMode>
												<TargetEntityType>ntg_audit</TargetEntityType>
												<ViewId>{0774A824-9E15-EE11-8F6D-000D3AAAE004}</ViewId>
												<ViewIds>{0774A824-9E15-EE11-8F6D-000D3AAAE004}</ViewIds>
												<RelationshipName>ntg_account_ntg_audit_accountid</RelationshipName>
											</parameters>
										</control>
									</cell>
								</row>
							</rows>
						</section>
					</sections>
				</column>
			</columns>
		</tab>
		<tab name="tab_client" id="{35403f79-8a4d-4f30-ba80-f3144facef03}" IsUserDefined="0" locklevel="0" showlabel="true">
			<labels>
				<label description="📈 Klient" languagecode="1029" />
				<label description="📈 Client" languagecode="1033" />
			</labels>
			<columns>
				<column width="100%">
					<sections>
						<section name="isoh2systemsection" id="{bc1ee855-c104-4b55-ac37-5501f945ba4e}" visible="true" IsUserDefined="0" locklevel="0" showlabel="true" showbar="false" layout="varwidth" celllabelalignment="Left" celllabelposition="Left" columns="1" labelwidth="115">
							<labels>
								<label description="ISOH2 SYNC" languagecode="1033" />
							</labels>
							<rows>
								<row>
									<cell id="{a88514e5-9f6b-4fa8-8cab-2d457cd2861e}" visible="true" labelid="{f9c7e9e5-5a4c-403b-a8ee-9868aa7d0cb9}">
										<labels>
											<label description="Zápis do ISOH je podmíněn platnou klientskou smlouvou podtypu 'VYR'." languagecode="1029" />
											<label description="The organization must be connected to ISOH as a Producer with an active contract." languagecode="1033" />
										</labels>
										<control id="ntg_isohnotconnectedelektromessage" classid="{39354E4A-5015-4D74-8031-EA9EB73A1322}" isunbound="true" />
									</cell>
								</row>
								<row>
									<cell id="{f4d51685-bdb1-4e1f-b35a-5255abaea971}" showlabel="false" visible="false" locklevel="0" colspan="1" rowspan="1">
										<labels>
											<label description="Synchronized With ISOH2" languagecode="1033" />
											<label description="Synchronizováno s ISOH2" languagecode="1029" />
										</labels>
										<control id="ntg_requesttoisohelektroid" classid="{270BD3DB-D9AF-4782-9025-509E298DEC0A}" datafieldname="ntg_requesttoisohelektroid" disabled="true" uniqueid="{08fa40cb-d5a7-4db4-89d4-b4be9f9a4837}">
											<parameters>
												<AutoResolve>true</AutoResolve>
												<DisableMru>false</DisableMru>
												<DisableQuickFind>false</DisableQuickFind>
												<DisableViewPicker>false</DisableViewPicker>
												<DefaultViewId>{6dfcdd55-1437-466c-bb3a-ebbbf526e170}</DefaultViewId>
												<AllowFilterOff>false</AllowFilterOff>
											</parameters>
										</control>
									</cell>
								</row>
							</rows>
						</section>
						<section name="isoh2batterysection" id="{ab3d9826-cd63-497d-a80c-2c5767e375cc}" visible="false" IsUserDefined="0" locklevel="0" showlabel="true" showbar="false" layout="varwidth" celllabelalignment="Left" celllabelposition="Left" columns="1" labelwidth="115">
							<labels>
								<label description="ISOH2 SYNC" languagecode="1033" />
							</labels>
							<rows>
								<row>
									<cell id="{7778beea-b962-4adc-a757-fabe76c08abc}" visible="false" labelid="{891c5ca2-8500-4a55-977b-208dad659448}">
										<labels>
											<label description="Zápis do ISOH je podmíněn platnou klientskou smlouvou podtypu 'BAT'." languagecode="1029" />
											<label description="The organization must be connected to ISOH as a Producer with an active contract." languagecode="1033" />
										</labels>
										<control id="ntg_isohnotconnectedbatterymessage" classid="{39354E4A-5015-4D74-8031-EA9EB73A1322}" isunbound="true" />
									</cell>
								</row>
								<row>
									<cell id="{1072fb90-a5c6-4487-9d14-fdff50561fd0}" visible="false" showlabel="false" locklevel="0" colspan="1" rowspan="1">
										<labels>
											<label description="Synchronized With ISOH2" languagecode="1033" />
											<label description="Synchronizováno s ISOH2" languagecode="1029" />
										</labels>
										<control id="ntg_requesttoisohbatteryid" classid="{270BD3DB-D9AF-4782-9025-509E298DEC0A}" datafieldname="ntg_requesttoisohbatteryid" disabled="true" uniqueid="{e657476b-f928-4513-92e7-32d0564c38ac}">
											<parameters>
												<AutoResolve>true</AutoResolve>
												<DisableMru>false</DisableMru>
												<DisableQuickFind>false</DisableQuickFind>
												<DisableViewPicker>false</DisableViewPicker>
												<DefaultViewId>{6dfcdd55-1437-466c-bb3a-ebbbf526e170}</DefaultViewId>
												<AllowFilterOff>false</AllowFilterOff>
											</parameters>
										</control>
									</cell>
								</row>
							</rows>
						</section>
					</sections>
				</column>
			</columns>
		</tab>
		<tab name="customertab" id="{4e39109b-10b7-4cd9-97c1-ee23643bbab4}" IsUserDefined="0" locklevel="0" showlabel="true">
			<labels>
				<label description="👩‍💼 Zákazník" languagecode="1029" />
				<label description="👩‍💼 Customer" languagecode="1033" />
			</labels>
			<columns>
				<column width="100%">
					<sections>
						<section name="profilesection" id="{c2bf482c-7389-404c-afec-3e712c46b8e0}" IsUserDefined="0" locklevel="0" showlabel="true" showbar="false" layout="varwidth" celllabelalignment="Left" celllabelposition="Left" columns="1" labelwidth="115">
							<labels>
								<label description="PROFIL" languagecode="1029" />
								<label description="PROFILE" languagecode="1033" />
							</labels>
							<rows>
								<row>
									<cell id="{a6feb28c-0665-4650-bf6b-c498ca746f4d}" locklevel="0" colspan="1" rowspan="1">
										<labels>
											<label description="Customer Registered On" languagecode="1033" />
											<label description="Datum registrace ZAK" languagecode="1029" />
										</labels>
										<control id="ntg_customerregisteredondate" classid="{5B773807-9FB2-42DB-97C3-7A91EFF8ADFF}" datafieldname="ntg_customerregisteredondate" disabled="false" />
									</cell>
								</row>
							</rows>
						</section>
						<section name="customerbillingreportRMBsection" id="c2d6feec-125a-44c2-b71f-577d83be836a" IsUserDefined="0" locklevel="0" showlabel="true" showbar="false" layout="varwidth" celllabelalignment="Left" celllabelposition="Left" columns="111" labelwidth="115">
							<labels>
								<label description="PODKLADY K FAKTURACI -  REMA BATTERY" languagecode="1029" />
								<label description="BILLING REPORTS - REMA BATTERY" languagecode="1033" />
							</labels>
							<rows>
								<row>
									<cell id="{5e5582eb-d6ef-41ef-9e12-4ef3c60b8e64}" locklevel="0" colspan="1" rowspan="1">
										<labels>
											<label description="Minimum Amount" languagecode="1033" />
											<label description="Minimální částka pro fakturaci" languagecode="1029" />
										</labels>
										<control id="ntg_rmb_customer_billingreportminimumamount" classid="{533B9E00-756B-4312-95A0-DC888637AC78}" datafieldname="ntg_rmb_customer_billingreportminimumamount" disabled="false" />
									</cell>
									<cell id="{481b7c6c-1a32-4b72-9745-9901e1498c57}" locklevel="0" colspan="1" rowspan="1">
										<labels>
											<label description="Billing Frequency" languagecode="1033" />
											<label description="Frekvence vystavení podkladů k fakturaci" languagecode="1029" />
										</labels>
										<control id="ntg_rmb_customer_billingfrequencytypecode" classid="{3EF39988-22BB-4F0B-BBBE-64B5A3748AEE}" datafieldname="ntg_rmb_customer_billingfrequencytypecode" disabled="false" />
									</cell>
									<cell id="{591fdec1-cc8c-487d-ad47-c9715b2f6523}" locklevel="0" colspan="1" rowspan="1">
										<labels>
											<label description="Split per Site" languagecode="1033" />
											<label description="Dělit podle provozoven" languagecode="1029" />
										</labels>
										<control id="ntg_rmb_customer_splitbillingreportpersite" classid="{67FAC785-CD58-4F9F-ABB3-4B7DDC6ED5ED}" datafieldname="ntg_rmb_customer_splitbillingreportpersite" disabled="false" />
									</cell>
								</row>
							</rows>
						</section>
						<section name="customerbillingreportRMSsection" id="8690211a-0f82-4496-b9c9-44b6d0bb21be" IsUserDefined="0" locklevel="0" showlabel="true" showbar="false" layout="varwidth" celllabelalignment="Left" celllabelposition="Left" columns="111" labelwidth="115">
							<labels>
								<label description="PODKLADY K FAKTURACI - REMA SYSTÉM" languagecode="1029" />
								<label description="BILLING REPORTS – REMA SYSTEM" languagecode="1033" />
							</labels>
							<rows>
								<row>
									<cell id="{54c6ff45-2604-4f3a-9046-e043c7a747ee}" locklevel="0" colspan="1" rowspan="1">
										<labels>
											<label description="Minimum Amount" languagecode="1033" />
											<label description="Minimální částka pro fakturaci" languagecode="1029" />
										</labels>
										<control id="ntg_rms_customer_billingreportminimumamount" classid="{533B9E00-756B-4312-95A0-DC888637AC78}" datafieldname="ntg_rms_customer_billingreportminimumamount" disabled="false" />
									</cell>
									<cell id="{467b66be-e2cb-439e-9f72-6303a563ac54}" locklevel="0" colspan="1" rowspan="1">
										<labels>
											<label description="Billing Frequency" languagecode="1033" />
											<label description="Frekvence vystavení podkladů k fakturaci" languagecode="1029" />
										</labels>
										<control id="ntg_rms_customer_billingfrequencytypecode" classid="{3EF39988-22BB-4F0B-BBBE-64B5A3748AEE}" datafieldname="ntg_rms_customer_billingfrequencytypecode" disabled="false" />
									</cell>
									<cell id="{41621f28-02cc-4c85-8776-48f00d08f458}" locklevel="0" colspan="1" rowspan="1">
										<labels>
											<label description="Split per Site" languagecode="1033" />
											<label description="Dělit podle provozoven" languagecode="1029" />
										</labels>
										<control id="ntg_rms_customer_splitbillingreportpersite" classid="{67FAC785-CD58-4F9F-ABB3-4B7DDC6ED5ED}" datafieldname="ntg_rms_customer_splitbillingreportpersite" disabled="false" />
									</cell>
								</row>
							</rows>
						</section>
						<section name="customercontractssection" id="{a0a51696-24d6-4206-a681-aa2ae80fd0c1}" IsUserDefined="0" locklevel="0" showlabel="true" showbar="false" layout="varwidth" celllabelalignment="Left" celllabelposition="Left" columns="1" labelwidth="115">
							<labels>
								<label description="ZÁKAZNICKÉ SMLOUVY" languagecode="1029" />
								<label description="CUSTOMER CONTRACTS" languagecode="1033" />
							</labels>
							<rows>
								<row>
									<cell locklevel="0" id="{81467060-f49f-4136-bb4c-c8c94c7b3531}" rowspan="4" colspan="1" auto="false" showlabel="false">
										<labels>
											<label description="Waste Processor Contracts" languagecode="1033" />
											<label description="Smlouvy" languagecode="1029" />
										</labels>
										<control indicationOfSubgrid="true" id="customercontractssubgrid" classid="{E7A81278-8635-4D9E-8D4D-59480B391C5B}" uniqueid="{37d0cecc-0277-464f-9aa5-75d398d12dd6}">
											<parameters>
												<RecordsPerPage>15</RecordsPerPage>
												<AutoExpand>Fixed</AutoExpand>
												<EnableQuickFind>true</EnableQuickFind>
												<EnableViewPicker>false</EnableViewPicker>
												<EnableChartPicker>false</EnableChartPicker>
												<TargetEntityType>talxis_contract</TargetEntityType>
												<ViewId>{add27c18-f0c2-4722-837a-41c1f1e304da}</ViewId>
												<ViewIds>{add27c18-f0c2-4722-837a-41c1f1e304da}</ViewIds>
												<RelationshipName>talxis_account_talxis_contract_counterpartyid</RelationshipName>
											</parameters>
										</control>
									</cell>
								</row>
								<row />
								<row />
								<row />
							</rows>
						</section>
						<section name="wastetakebackpointssection" id="{11d2f68e-324c-426f-b980-5ab50f81c019}" IsUserDefined="0" locklevel="0" showlabel="true" showbar="false" layout="varwidth" celllabelalignment="Left" celllabelposition="Left" columns="1" labelwidth="115">
							<labels>
								<label description="MÍSTA ZPĚTNÉHO ODBĚRU" languagecode="1029" />
								<label description="WASTE TAKE-BACK POINTS" languagecode="1033" />
							</labels>
							<rows>
								<row>
									<cell locklevel="0" id="{5a15bd75-431b-4f0e-aa3d-6b504b25582e}" rowspan="4" colspan="1" auto="false" showlabel="false">
										<labels>
											<label description="waste take back points" languagecode="1033" />
											<label description="Místa zpětného odběru" languagecode="1029" />
										</labels>
										<control indicationOfSubgrid="true" id="wastetakebackpointssubgrid" classid="{E7A81278-8635-4D9E-8D4D-59480B391C5B}" uniqueid="{46754cad-8666-4a01-800e-7ac89c5887e2}">
											<parameters>
												<RecordsPerPage>15</RecordsPerPage>
												<AutoExpand>Fixed</AutoExpand>
												<EnableQuickFind>true</EnableQuickFind>
												<EnableViewPicker>false</EnableViewPicker>
												<EnableChartPicker>false</EnableChartPicker>
												<TargetEntityType>talxis_amenity</TargetEntityType>
												<ViewId>{B4FC265A-2BC9-EE11-9078-0022489E400F}</ViewId>
												<ViewIds>{B4FC265A-2BC9-EE11-9078-0022489E400F}</ViewIds>
												<RelationshipName>ntg_account_talxis_amenity_accountid</RelationshipName>
											</parameters>
										</control>
									</cell>
								</row>
								<row />
								<row />
								<row />
							</rows>
						</section>
						<section name="collectionbinssection" id="{a934c36b-e898-4705-9859-e3e85f7e574c}" IsUserDefined="0" locklevel="0" showlabel="true" showbar="false" layout="varwidth" celllabelalignment="Left" celllabelposition="Left" columns="1" labelwidth="115">
							<labels>
								<label description="SBĚRNÉ NÁDOBY" languagecode="1029" />
								<label description="COLLECTION BINS" languagecode="1033" />
							</labels>
							<rows>
								<row>
									<cell locklevel="0" id="{3ee359c0-7859-45cd-8af1-0c8b6c27bd74}" rowspan="4" colspan="1" auto="false" showlabel="false">
										<labels>
											<label description="Collection Bins" languagecode="1033" />
											<label description="Sběrné nádoby" languagecode="1029" />
										</labels>
										<control indicationOfSubgrid="true" id="collectionbinssubgrid" classid="{E7A81278-8635-4D9E-8D4D-59480B391C5B}" uniqueid="{913c2332-4da7-44fc-a2d9-1455e77ad947}">
											<parameters>
												<RecordsPerPage>10</RecordsPerPage>
												<AutoExpand>Fixed</AutoExpand>
												<EnableQuickFind>true</EnableQuickFind>
												<EnableViewPicker>false</EnableViewPicker>
												<EnableChartPicker>true</EnableChartPicker>
												<ChartGridMode>All</ChartGridMode>
												<TargetEntityType>talxis_wastecollectionbin</TargetEntityType>
												<ViewId>{cd266ada-97f2-ee11-904c-6045bd97f124}</ViewId>
												<ViewIds>{cd266ada-97f2-ee11-904c-6045bd97f124}</ViewIds>
												<RelationshipName>ntg_account_talxis_wastecollectionbin_accountid</RelationshipName>
											</parameters>
										</control>
									</cell>
								</row>
								<row />
								<row />
								<row />
							</rows>
						</section>
						<section name="customerbillingreportssection" id="ce015c8a-ed69-4640-a483-7b9733dc0322" IsUserDefined="0" locklevel="0" showlabel="true" showbar="false" layout="varwidth" celllabelalignment="Left" celllabelposition="Left" columns="1" labelwidth="115">
							<labels>
								<label description="PODKLADY K FAKTURACI" languagecode="1029" />
								<label description="BILLING REPORTS" languagecode="1033" />
							</labels>
							<rows>
								<row>
									<cell locklevel="0" id="{c526d988-0100-4e01-8f88-ba7ba82ebf9d}" rowspan="4" colspan="1" auto="false" showlabel="false">
										<labels>
											<label description="BILLING REPORTS" languagecode="1033" />
											<label description="PODKLADY K FAKTURACI" languagecode="1029" />
										</labels>
										<control indicationOfSubgrid="true" id="customerbillingreportssubgrid" classid="{E7A81278-8635-4D9E-8D4D-59480B391C5B}">
											<parameters>
												<RecordsPerPage>10</RecordsPerPage>
												<AutoExpand>Fixed</AutoExpand>
												<EnableQuickFind>false</EnableQuickFind>
												<EnableViewPicker>false</EnableViewPicker>
												<EnableChartPicker>true</EnableChartPicker>
												<ChartGridMode>All</ChartGridMode>
												<RelationshipName>talxis_account_talxis_billingreportheader_billtoaccountid</RelationshipName>
												<TargetEntityType>talxis_billingreportheader</TargetEntityType>
												<ViewId>{5CC88F1E-D1EB-F011-8406-002248A3490F}</ViewId>
												<ViewIds>{5CC88F1E-D1EB-F011-8406-002248A3490F}</ViewIds>
											</parameters>
										</control>
									</cell>
								</row>
							</rows>
						</section>
					</sections>
				</column>
			</columns>
		</tab>
		<tab name="tab_carier" id="874eaf4d-8e50-4102-a767-fc9ca991974a" IsUserDefined="0" locklevel="0" showlabel="true">
			<labels>
				<label description="🚚 Dopravce" languagecode="1029" />
				<label description="🚚 Carrier" languagecode="1033" />
			</labels>
			<columns>
				<column width="100%">
					<sections>
						<section name="carrierbillingreportRMBsection" id="3afe1f9a-0653-4620-9989-282be60c66bd" IsUserDefined="0" locklevel="0" showlabel="true" showbar="false" layout="varwidth" celllabelalignment="Left" celllabelposition="Left" columns="111" labelwidth="115">
							<labels>
								<label description="PODKLADY K FAKTURACI -  REMA BATTERY" languagecode="1029" />
								<label description="BILLING REPORTS - REMA BATTERY" languagecode="1033" />
							</labels>
							<rows>
								<row>
									<cell id="{1bbda66d-ad1d-4673-b680-6c5fbe419e00}" locklevel="0" colspan="1" rowspan="1">
										<labels>
											<label description="Minimum Amount" languagecode="1033" />
											<label description="Minimální částka pro fakturaci" languagecode="1029" />
										</labels>
										<control id="ntg_rmb_carrier_billingreportminimumamount" classid="{533B9E00-756B-4312-95A0-DC888637AC78}" datafieldname="ntg_rmb_carrier_billingreportminimumamount" disabled="false" />
									</cell>
									<cell id="{bd947da3-95c8-4d02-bef5-581f2705f42d}" locklevel="0" colspan="1" rowspan="1">
										<labels>
											<label description="Billing Frequency" languagecode="1033" />
											<label description="Frekvence vystavení podkladů k fakturaci" languagecode="1029" />
										</labels>
										<control id="ntg_rmb_carrier_billingfrequencytypecode" classid="{3EF39988-22BB-4F0B-BBBE-64B5A3748AEE}" datafieldname="ntg_rmb_carrier_billingfrequencytypecode" disabled="false" />
									</cell>
									<cell id="{da52e98d-782b-470c-9e0b-8da37766b5c1}" locklevel="0" colspan="1" rowspan="1">
										<labels>
											<label description="Split per Site" languagecode="1033" />
											<label description="Dělit podle provozoven" languagecode="1029" />
										</labels>
										<control id="ntg_rmb_carrier_splitbillingreportpersite" classid="{67FAC785-CD58-4F9F-ABB3-4B7DDC6ED5ED}" datafieldname="ntg_rmb_carrier_splitbillingreportpersite" disabled="false" />
									</cell>
								</row>
							</rows>
						</section>
						<section name="carrierbillingreportRMSsection" id="3c364485-321d-4558-bec6-ca7fea250330" IsUserDefined="0" locklevel="0" showlabel="true" showbar="false" layout="varwidth" celllabelalignment="Left" celllabelposition="Left" columns="111" labelwidth="115">
							<labels>
								<label description="PODKLADY K FAKTURACI - REMA SYSTÉM" languagecode="1029" />
								<label description="BILLING REPORTS – REMA SYSTEM" languagecode="1033" />
							</labels>
							<rows>
								<row>
									<cell id="{0510831b-8c7e-42ca-8499-ac4f088fed46}" locklevel="0" colspan="1" rowspan="1">
										<labels>
											<label description="Minimum Amount" languagecode="1033" />
											<label description="Minimální částka pro fakturaci" languagecode="1029" />
										</labels>
										<control id="ntg_rms_carrier_billingreportminimumamount" classid="{533B9E00-756B-4312-95A0-DC888637AC78}" datafieldname="ntg_rms_carrier_billingreportminimumamount" disabled="false" />
									</cell>
									<cell id="{924974ee-59c1-4a21-9337-24abe040c108}" locklevel="0" colspan="1" rowspan="1">
										<labels>
											<label description="Billing Frequency" languagecode="1033" />
											<label description="Frekvence vystavení podkladů k fakturaci" languagecode="1029" />
										</labels>
										<control id="ntg_rms_carrier_billingfrequencytypecode" classid="{3EF39988-22BB-4F0B-BBBE-64B5A3748AEE}" datafieldname="ntg_rms_carrier_billingfrequencytypecode" disabled="false" />
									</cell>
									<cell id="{35ec1cf6-cafc-4097-a751-fef70931c279}" locklevel="0" colspan="1" rowspan="1">
										<labels>
											<label description="Split per Site" languagecode="1033" />
											<label description="Dělit podle provozoven" languagecode="1029" />
										</labels>
										<control id="ntg_rms_carrier_splitbillingreportpersite" classid="{67FAC785-CD58-4F9F-ABB3-4B7DDC6ED5ED}" datafieldname="ntg_rms_carrier_splitbillingreportpersite" disabled="false" />
									</cell>
								</row>
							</rows>
						</section>
						<section name="carriersection" id="{5916e517-acd4-417e-98ce-60453b2b38a6}" IsUserDefined="0" locklevel="0" visible="false" showlabel="true" showbar="false" layout="varwidth" celllabelalignment="Left" celllabelposition="Left" columns="1" labelwidth="115">
							<labels>
								<label description="INFORMACE O DOPRAVCI" languagecode="1029" />
								<label description="CARRIER INFORMATION" languagecode="1033" />
							</labels>
							<rows>
								<row>
									<cell locklevel="0" id="{9830b094-d46c-43d1-85fd-0dc7e8e326e2}" rowspan="4" colspan="1" auto="true" showlabel="false">
										<labels>
											<label description="Carriers information" languagecode="1033" />
											<label description="Informace k dopraci" languagecode="1029" />
										</labels>
										<control indicationOfSubgrid="true" id="importedproductmodelssubgrid" classid="{E7A81278-8635-4D9E-8D4D-59480B391C5B}" uniqueid="{019a7573-8bc0-4bc8-9609-d2102407594a}">
											<parameters>
												<RecordsPerPage>10</RecordsPerPage>
												<AutoExpand>Auto</AutoExpand>
												<EnableQuickFind>false</EnableQuickFind>
												<EnableViewPicker>false</EnableViewPicker>
												<EnableChartPicker>false</EnableChartPicker>
												<ChartGridMode>Grid</ChartGridMode>
												<TargetEntityType>ntg_carrierinformation</TargetEntityType>
												<ViewId>{3f7af499-5316-ee11-8f6d-000d3aaaec11}</ViewId>
												<ViewIds>{3f7af499-5316-ee11-8f6d-000d3aaaec11}</ViewIds>
												<RelationshipName>ntg_account_ntg_carrierinformation_accountid</RelationshipName>
											</parameters>
										</control>
									</cell>
								</row>
							</rows>
						</section>
						<section name="carriercontractssection" id="{f46b957e-800e-4faa-af05-fdb65b678ea2}" IsUserDefined="0" locklevel="0" showlabel="true" showbar="false" layout="varwidth" celllabelalignment="Left" celllabelposition="Left" columns="1" labelwidth="115">
							<labels>
								<label description="SMLOUVY DOPRAVCE" languagecode="1029" />
								<label description="CARRIER CONTRACTS" languagecode="1033" />
							</labels>
							<rows>
								<row>
									<cell locklevel="0" id="{81467060-f49f-4136-bb4c-c8c94c7b3531}" rowspan="4" colspan="1" auto="false" showlabel="false">
										<labels>
											<label description="Waste Processor Contracts" languagecode="1033" />
											<label description="Smlouvy" languagecode="1029" />
										</labels>
										<control indicationOfSubgrid="true" id="carriercontractssubgrid" classid="{E7A81278-8635-4D9E-8D4D-59480B391C5B}" uniqueid="{615d202f-ce24-40f8-98ec-be7aff2856d4}">
											<parameters>
												<RecordsPerPage>15</RecordsPerPage>
												<AutoExpand>Fixed</AutoExpand>
												<EnableQuickFind>true</EnableQuickFind>
												<EnableViewPicker>false</EnableViewPicker>
												<EnableChartPicker>false</EnableChartPicker>
												<TargetEntityType>talxis_contract</TargetEntityType>
												<ViewId>{4ecc9363-2e31-4b68-a5a7-e98fefb5308b}</ViewId>
												<ViewIds>{4ecc9363-2e31-4b68-a5a7-e98fefb5308b}</ViewIds>
												<RelationshipName>talxis_account_talxis_contract_counterpartyid</RelationshipName>
											</parameters>
										</control>
									</cell>
								</row>
							</rows>
						</section>
						<section name="wastetakebackpointscarriersection" id="{778cd68c-a06b-4fb0-80cd-c4d91397f98e}" columns="1" showlabel="true" showbar="true" IsUserDefined="0" locklevel="0" labelwidth="130" celllabelalignment="Left" celllabelposition="Left" labelid="{27b4527e-1203-4037-b669-420078287e07}">
							<labels>
								<label description="MZO" languagecode="1029" />
								<label description="WASTE TAKE BACK POINTS" languagecode="1033" />
							</labels>
							<rows>
								<row>
									<cell locklevel="0" id="{77072ca2-1844-4356-be58-4df0b0618f6d}" rowspan="4" colspan="1" auto="false" showlabel="false">
										<labels>
											<label description="SERVICED WASTE TAKE BACK POINTS" languagecode="1033" />
											<label description="OBSLUHOVANÁ MZO" languagecode="1029" />
										</labels>
										<control indicationOfSubgrid="true" id="exclusiveconnectionssubgrid" classid="{E7A81278-8635-4D9E-8D4D-59480B391C5B}" uniqueid="{6a40f237-e441-42ac-829b-cdb231c848da}">
											<parameters>
												<RecordsPerPage>15</RecordsPerPage>
												<AutoExpand>Fixed</AutoExpand>
												<EnableQuickFind>true</EnableQuickFind>
												<EnableViewPicker>false</EnableViewPicker>
												<EnableChartPicker>false</EnableChartPicker>
												<TargetEntityType>ntg_exclusivesiteconnection</TargetEntityType>
												<ViewId>{ebe2ef52-3b74-ef11-ac20-6045bdf5c942}</ViewId>
												<ViewIds>{ebe2ef52-3b74-ef11-ac20-6045bdf5c942}</ViewIds>
												<RelationshipName>ntg_account_ntg_exclusivesiteconnection_accountid</RelationshipName>
											</parameters>
										</control>
									</cell>
								</row>
							</rows>
						</section>
						<section name="bintypesection" id="{f1461635-2c71-4da9-a9f1-19813f3c679f}" IsUserDefined="0" locklevel="0" showlabel="true" showbar="false" layout="varwidth" celllabelalignment="Left" celllabelposition="Left" columns="1" labelwidth="115">
							<labels>
								<label description="TYPY NÁDOB POSKYTOVANÉ ORGANIZACÍ" languagecode="1029" />
								<label description="BIN TYPES PROVIDED BY ACCOUNT" languagecode="1033" />
							</labels>
							<rows>
								<row>
									<cell locklevel="0" id="{fc902447-fd50-4c5b-91b6-fc4334c08656}" showlabel="false" rowspan="12" colspan="1" auto="false">
										<labels>
											<label description="Bins" languagecode="1033" />
											<label description="Nádoby" languagecode="1029" />
										</labels>
										<control indicationOfSubgrid="true" id="bintypessubgrid" classid="{E7A81278-8635-4D9E-8D4D-59480B391C5B}" uniqueid="{50ba401e-ddb3-406e-96d0-923b03c2ab54}">
											<parameters>
												<RecordsPerPage>10</RecordsPerPage>
												<AutoExpand>Fixed</AutoExpand>
												<EnableQuickFind>false</EnableQuickFind>
												<EnableViewPicker>false</EnableViewPicker>
												<EnableChartPicker>true</EnableChartPicker>
												<ChartGridMode>All</ChartGridMode>
												<TargetEntityType>ntg_wastecollectionbintypeowner</TargetEntityType>
												<ViewId>{9088f3a8-6952-4b21-9d55-944751a4a34e}</ViewId>
												<ViewIds>{9088f3a8-6952-4b21-9d55-944751a4a34e}</ViewIds>
												<RelationshipName>ntg_account_ntg_wastecollectionbintypeowner_accountid</RelationshipName>
											</parameters>
										</control>
									</cell>
								</row>
								<row />
								<row />
								<row />
								<row />
								<row />
								<row />
								<row />
								<row />
								<row />
								<row />
								<row />
								<row />
							</rows>
						</section>
						<section name="carrierbillingreportssection" id="5f6375bf-3572-46dd-bb9b-5af10084edf7" IsUserDefined="0" locklevel="0" showlabel="true" showbar="false" layout="varwidth" celllabelalignment="Left" celllabelposition="Left" columns="1" labelwidth="115">
							<labels>
								<label description="PODKLADY K FAKTURACI" languagecode="1029" />
								<label description="BILLING REPORTS" languagecode="1033" />
							</labels>
							<rows>
								<row>
									<cell locklevel="0" id="{12f20bf9-89de-479d-8853-99c0de98814d}" rowspan="4" colspan="1" auto="false" showlabel="false">
										<labels>
											<label description="BILLING REPORTS" languagecode="1033" />
											<label description="PODKLADY K FAKTURACI" languagecode="1029" />
										</labels>
										<control indicationOfSubgrid="true" id="carrierbillingreportssubgrid" classid="{E7A81278-8635-4D9E-8D4D-59480B391C5B}">
											<parameters>
												<RecordsPerPage>10</RecordsPerPage>
												<AutoExpand>Fixed</AutoExpand>
												<EnableQuickFind>false</EnableQuickFind>
												<EnableViewPicker>false</EnableViewPicker>
												<EnableChartPicker>true</EnableChartPicker>
												<ChartGridMode>All</ChartGridMode>
												<RelationshipName>talxis_account_talxis_billingreportheader_billtoaccountid</RelationshipName>
												<TargetEntityType>talxis_billingreportheader</TargetEntityType>
												<ViewId>{70DF7802-D1EB-F011-8406-000D3AB7B3C3}</ViewId>
												<ViewIds>{70DF7802-D1EB-F011-8406-000D3AB7B3C3}</ViewIds>
											</parameters>
										</control>
									</cell>
								</row>
							</rows>
						</section>
					</sections>
				</column>
			</columns>
		</tab>
		<tab name="tab_processor" id="c4f5d295-5973-42a3-ac38-db006bea1296" IsUserDefined="0" locklevel="0" showlabel="true">
			<labels>
				<label description="⚙️ Zpracovatel" languagecode="1029" />
				<label description="⚙️ Processor" languagecode="1033" />
			</labels>
			<columns>
				<column width="100%">
					<sections>
						<section name="wasteprocessorconfig" id="{eb3aca34-4823-4134-a82a-fb16e6787ef8}" IsUserDefined="0" locklevel="0" showlabel="true" showbar="false" layout="varwidth" celllabelalignment="Left" celllabelposition="Left" columns="1" labelwidth="115">
							<labels>
								<label description="PROFIL" languagecode="1029" />
								<label description="PROFILE" languagecode="1033" />
							</labels>
							<rows>
								<row>
									<cell locklevel="0" id="{96f7267c-641d-462d-b3c3-85e2ae535dde}" rowspan="4" colspan="1" auto="false" showlabel="true">
										<labels>
											<label description="Enable CHANGE orders" languagecode="1033" />
											<label description="Povolit objednávky převodu mezi skupinami" languagecode="1029" />
										</labels>
										<control id="ntg_isenabledforchangerequests" classid="{67FAC785-CD58-4f9f-ABB3-4B7DDC6ED5ED}" datafieldname="ntg_isenabledforchangerequests" disabled="true" />
									</cell>
								</row>
							</rows>
						</section>
						<section name="processorbillingreportRMBsection" id="b374aff6-4deb-48f3-9691-f9177a9c2273" IsUserDefined="0" locklevel="0" showlabel="true" showbar="false" layout="varwidth" celllabelalignment="Left" celllabelposition="Left" columns="111" labelwidth="115">
							<labels>
								<label description="PODKLADY K FAKTURACI -  REMA BATTERY" languagecode="1029" />
								<label description="BILLING REPORTS - REMA BATTERY" languagecode="1033" />
							</labels>
							<rows>
								<row>
									<cell id="{6d88f56f-ec73-4578-9e7d-e985ad280720}" locklevel="0" colspan="1" rowspan="1">
										<labels>
											<label description="Billing Report – Minimum Amount" languagecode="1033" />
											<label description="Minimální částka pro podklad k fakturaci" languagecode="1029" />
										</labels>
										<control id="ntg_rmb_wasteprocessor_billingreportminimumamount" classid="{533B9E00-756B-4312-95A0-DC888637AC78}" datafieldname="ntg_rmb_wasteprocessor_billingreportminimumamount" disabled="false" />
									</cell>
									<cell id="{14570658-2d25-49d9-8ec2-7fc69afc11e1}" locklevel="0" colspan="1" rowspan="1">
										<labels>
											<label description="Billing Frequency" languagecode="1033" />
											<label description="Frekvence vystavení podkladů k fakturaci" languagecode="1029" />
										</labels>
										<control id="ntg_rmb_wasteprocessor_billingfrequencytypecode" classid="{3EF39988-22BB-4F0B-BBBE-64B5A3748AEE}" datafieldname="ntg_rmb_wasteprocessor_billingfrequencytypecode" disabled="false" />
									</cell>
									<cell id="{015dd82a-f2ef-4203-abad-480622c2eaf1}" locklevel="0" colspan="1" rowspan="1">
										<labels>
											<label description="Billing Report – Split per Site" languagecode="1033" />
											<label description="Dělit podklad podle provozoven" languagecode="1029" />
										</labels>
										<control id="ntg_rmb_wasteprocessor_splitbillingreportpersite" classid="{67FAC785-CD58-4F9F-ABB3-4B7DDC6ED5ED}" datafieldname="ntg_rmb_wasteprocessor_splitbillingreportpersite" disabled="false" />
									</cell>
								</row>
							</rows>
						</section>
						<section name="processorbillingreportRMSsection" id="1606198b-ccb4-4802-a093-6aa171cd15cd" IsUserDefined="0" locklevel="0" showlabel="true" showbar="false" layout="varwidth" celllabelalignment="Left" celllabelposition="Left" columns="111" labelwidth="115">
							<labels>
								<label description="PODKLADY K FAKTURACI - REMA SYSTÉM" languagecode="1029" />
								<label description="BILLING REPORTS – REMA SYSTEM" languagecode="1033" />
							</labels>
							<rows>
								<row>
									<cell id="{8f6aa5b7-1f9f-46e6-98c0-4069dc496ee1}" locklevel="0" colspan="1" rowspan="1">
										<labels>
											<label description="Billing Report – Minimum Amount" languagecode="1033" />
											<label description="Minimální částka pro podklad k fakturaci" languagecode="1029" />
										</labels>
										<control id="ntg_rms_wasteprocessor_billingreportminimumamount" classid="{533B9E00-756B-4312-95A0-DC888637AC78}" datafieldname="ntg_rms_wasteprocessor_billingreportminimumamount" disabled="false" />
									</cell>
									<cell id="{e2486ebe-d38f-443e-864b-29a9fd622c4c}" locklevel="0" colspan="1" rowspan="1">
										<labels>
											<label description="Billing Frequency" languagecode="1033" />
											<label description="Frekvence vystavení podkladů k fakturaci" languagecode="1029" />
										</labels>
										<control id="ntg_rms_wasteprocessor_billingfrequencytypecode" classid="{3EF39988-22BB-4F0B-BBBE-64B5A3748AEE}" datafieldname="ntg_rms_wasteprocessor_billingfrequencytypecode" disabled="false" />
									</cell>
									<cell id="{313d1588-b69d-4962-8887-91f8e0dc613d}" locklevel="0" colspan="1" rowspan="1">
										<labels>
											<label description="Billing Report – Split per Site" languagecode="1033" />
											<label description="Dělit podle provozoven" languagecode="1029" />
										</labels>
										<control id="ntg_rms_wasteprocessor_splitbillingreportpersite" classid="{67FAC785-CD58-4F9F-ABB3-4B7DDC6ED5ED}" datafieldname="ntg_rms_wasteprocessor_splitbillingreportpersite" disabled="false" />
									</cell>
								</row>
							</rows>
						</section>
						<section name="wasteprocessorsection" id="{a151de2b-1933-4b41-86b2-3b09214b24d8}" IsUserDefined="0" locklevel="0" visible="false" showlabel="true" showbar="false" layout="varwidth" celllabelalignment="Left" celllabelposition="Left" columns="1" labelwidth="115">
							<labels>
								<label description="INFORMACE O ZPRACOVATELI" languagecode="1029" />
								<label description="WASTE PROCESSOR INFORMATION" languagecode="1033" />
							</labels>
							<rows>
								<row>
									<cell locklevel="0" id="{f262d99c-b208-4031-b598-f0b7c42d0264}" rowspan="4" colspan="1" auto="true" showlabel="false">
										<labels>
											<label description="Waste processor information" languagecode="1033" />
											<label description="Informace o zpracovateli" languagecode="1029" />
										</labels>
										<control indicationOfSubgrid="true" id="importedproductmodelssubgrid" classid="{E7A81278-8635-4D9E-8D4D-59480B391C5B}" uniqueid="{4d87cfd4-64f8-41e4-b82a-512cacf08a9e}">
											<parameters>
												<RecordsPerPage>10</RecordsPerPage>
												<AutoExpand>Auto</AutoExpand>
												<EnableQuickFind>false</EnableQuickFind>
												<EnableViewPicker>false</EnableViewPicker>
												<EnableChartPicker>false</EnableChartPicker>
												<ChartGridMode>Grid</ChartGridMode>
												<TargetEntityType>ntg_wasteprocessorinformation</TargetEntityType>
												<ViewId>{ac7ffee3-6716-ee11-8f6d-000d3aaaec11}</ViewId>
												<ViewIds>{ac7ffee3-6716-ee11-8f6d-000d3aaaec11}</ViewIds>
												<RelationshipName>ntg_account_ntg_wasteprocessorinformation_accountid</RelationshipName>
											</parameters>
										</control>
									</cell>
								</row>
							</rows>
						</section>
						<section name="wasteprocessorcontractssection" id="{139e2e95-f1ea-40f5-9393-6d684497301b}" IsUserDefined="0" locklevel="0" showlabel="true" showbar="false" layout="varwidth" celllabelalignment="Left" celllabelposition="Left" columns="1" labelwidth="115">
							<labels>
								<label description="SMLOUVY ZPRACOVATELE" languagecode="1029" />
								<label description="WASTE PROCESSOR CONTRACTS" languagecode="1033" />
							</labels>
							<rows>
								<row>
									<cell locklevel="0" id="{81467060-f49f-4136-bb4c-c8c94c7b3531}" rowspan="4" colspan="1" auto="false" showlabel="false">
										<labels>
											<label description="Waste Processor Contracts" languagecode="1033" />
											<label description="Smlouvy" languagecode="1029" />
										</labels>
										<control indicationOfSubgrid="true" id="wasteprocessorcontractssubgrid" classid="{E7A81278-8635-4D9E-8D4D-59480B391C5B}" uniqueid="{8d014bcf-538a-4be3-9ce7-bb9ab51709fc}">
											<parameters>
												<RecordsPerPage>15</RecordsPerPage>
												<AutoExpand>Fixed</AutoExpand>
												<EnableQuickFind>true</EnableQuickFind>
												<EnableViewPicker>false</EnableViewPicker>
												<EnableChartPicker>false</EnableChartPicker>
												<TargetEntityType>talxis_contract</TargetEntityType>
												<ViewId>{1605e21f-fb01-44d5-ba5f-9d0865303145}</ViewId>
												<ViewIds>{1605e21f-fb01-44d5-ba5f-9d0865303145}</ViewIds>
												<RelationshipName>talxis_account_talxis_contract_counterpartyid</RelationshipName>
											</parameters>
										</control>
									</cell>
								</row>
								<row />
								<row />
								<row />
							</rows>
						</section>
						<section name="recyclingamenitiessubgridsection" id="{67eefc2d-906b-4b0c-9d80-54c360f49ca2}" IsUserDefined="0" locklevel="0" showlabel="true" showbar="false" layout="varwidth" celllabelalignment="Left" celllabelposition="Left" columns="1" labelwidth="115">
							<labels>
								<label description="RECYKLAČNÍ ZAŘÍZENÍ" languagecode="1029" />
								<label description="RECYCLING AMENITIES" languagecode="1033" />
							</labels>
							<rows>
								<row />
								<row>
									<cell locklevel="0" id="{c7481b03-0af7-4a7e-927d-e4d1c657876f}" rowspan="4" colspan="1" auto="false" showlabel="false">
										<labels>
											<label description="Recycling amenities" languagecode="1033" />
											<label description="Recyklační zařízení" languagecode="1029" />
										</labels>
										<control indicationOfSubgrid="true" id="recyclingamenitiessubgrid" classid="{E7A81278-8635-4D9E-8D4D-59480B391C5B}" uniqueid="{e9c08c1b-bbe0-4281-86eb-eef3a8c7533e}">
											<parameters>
												<RecordsPerPage>4</RecordsPerPage>
												<AutoExpand>Fixed</AutoExpand>
												<EnableQuickFind>false</EnableQuickFind>
												<EnableViewPicker>false</EnableViewPicker>
												<EnableChartPicker>true</EnableChartPicker>
												<ChartGridMode>Chart</ChartGridMode>
												<TargetEntityType>talxis_recyclingamenity</TargetEntityType>
												<ViewId>{BC1751A8-426D-41B1-BE1A-F6869CD4E84C}</ViewId>
												<ViewIds>{BC1751A8-426D-41B1-BE1A-F6869CD4E84C}</ViewIds>
												<RelationshipName>ntg_account_talxis_recyclingamenity_accountid</RelationshipName>
											</parameters>
										</control>
									</cell>
								</row>
								<row />
								<row />
								<row />
							</rows>
						</section>
						<section name="inventorytransactionssection" id="{0c5f302d-70e5-4056-8e7b-36acc2146bf9}" IsUserDefined="0" locklevel="0" showlabel="true" showbar="false" layout="varwidth" celllabelalignment="Left" celllabelposition="Left" columns="1" labelwidth="115">
							<labels>
								<label description="SKLADOVÉ POHYBY" languagecode="1029" />
								<label description="INVENTORY TRANSACTION" languagecode="1033" />
							</labels>
							<rows>
								<row />
								<row>
									<cell id="{3b35fd0d-a4cc-4367-a056-2fb640d76420}" showlabel="false" colspan="1" auto="false" rowspan="12">
										<labels>
											<label description="Inventory transactions" languagecode="1033" />
											<label description="Skladové pohyby" languagecode="1029" />
										</labels>
										<control indicationOfSubgrid="true" id="transactions" classid="{E7A81278-8635-4D9E-8D4D-59480B391C5B}">
											<parameters>
												<RecordsPerPage>20</RecordsPerPage>
												<AutoExpand>Fixed</AutoExpand>
												<EnableQuickFind>false</EnableQuickFind>
												<EnableViewPicker>false</EnableViewPicker>
												<EnableChartPicker>true</EnableChartPicker>
												<ChartGridMode>All</ChartGridMode>
												<RelationshipName></RelationshipName>
												<TargetEntityType>talxis_inventorytransaction</TargetEntityType>
												<ViewId>{DE338D9E-4715-F011-998A-7C1E5288140D}</ViewId>
												<ViewIds>{DE338D9E-4715-F011-998A-7C1E5288140D}</ViewIds>
											</parameters>
										</control>
									</cell>
								</row>
								<row />
							</rows>
						</section>
						<section name="wasteprocessorbillingreportssection" id="cad1450c-e70f-46af-b99c-208786dad743" IsUserDefined="0" locklevel="0" showlabel="true" showbar="false" layout="varwidth" celllabelalignment="Left" celllabelposition="Left" columns="1" labelwidth="115">
							<labels>
								<label description="PODKLADY K FAKTURACI" languagecode="1029" />
								<label description="BILLING REPORTS" languagecode="1033" />
							</labels>
							<rows>
								<row>
									<cell locklevel="0" id="{85b6d61d-e8fa-4051-8b26-113227f35f65}" rowspan="4" colspan="1" auto="false" showlabel="false">
										<labels>
											<label description="BILLING REPORTS" languagecode="1033" />
											<label description="PODKLADY K FAKTURACI" languagecode="1029" />
										</labels>
										<control indicationOfSubgrid="true" id="wasteprocessorbillingreportssubgrid" classid="{E7A81278-8635-4D9E-8D4D-59480B391C5B}">
											<parameters>
												<RecordsPerPage>10</RecordsPerPage>
												<AutoExpand>Fixed</AutoExpand>
												<EnableQuickFind>false</EnableQuickFind>
												<EnableViewPicker>false</EnableViewPicker>
												<EnableChartPicker>true</EnableChartPicker>
												<ChartGridMode>All</ChartGridMode>
												<RelationshipName>talxis_account_talxis_billingreportheader_billtoaccountid</RelationshipName>
												<TargetEntityType>talxis_billingreportheader</TargetEntityType>
												<ViewId>{28748C2A-D1EB-F011-8406-7CED8D731989}</ViewId>
												<ViewIds>{28748C2A-D1EB-F011-8406-7CED8D731989}</ViewIds>
											</parameters>
										</control>
									</cell>
								</row>
							</rows>
						</section>
					</sections>
				</column>
			</columns>
		</tab>
		<tab name="leasestab" id="{0218abc4-9b79-4161-8372-81344e4645ca}" IsUserDefined="0" locklevel="0" showlabel="true">
			<labels>
				<label description="📥 Nájmy" languagecode="1029" />
				<label description="📥 Leases" languagecode="1033" />
			</labels>
			<columns>
				<column width="100%">
					<sections>
						<section name="leaseprovidersection" id="{179d7cd6-cee8-4621-b078-e7d788edd4f6}" IsUserDefined="0" locklevel="0" showlabel="true" showbar="false" layout="varwidth" celllabelalignment="Left" celllabelposition="Left" columns="1" labelwidth="115">
							<labels>
								<label description="PRONAJÍMATEL" languagecode="1029" />
								<label description="LEASE PROVIDER" languagecode="1033" />
							</labels>
							<rows>
								<row>
									<cell locklevel="0" id="{9691cf14-d002-4fe1-aa62-c1680ac66020}" showlabel="false" rowspan="12" colspan="1" auto="false">
										<labels>
											<label description="Lease Provider" languagecode="1033" />
											<label description="Pronajímatel" languagecode="1029" />
										</labels>
										<control indicationOfSubgrid="true" id="leaseprovidersubgrid" classid="{E7A81278-8635-4D9E-8D4D-59480B391C5B}" uniqueid="{9170a02b-49b9-4534-b189-91cbb4ca2666}">
											<parameters>
												<RecordsPerPage>100</RecordsPerPage>
												<AutoExpand>Fixed</AutoExpand>
												<EnableQuickFind>false</EnableQuickFind>
												<EnableViewPicker>false</EnableViewPicker>
												<EnableChartPicker>true</EnableChartPicker>
												<ChartGridMode>All</ChartGridMode>
												<TargetEntityType>talxis_subscription</TargetEntityType>
												<ViewId>{6565771e-caa5-ec11-983f-0022489b7ae7}</ViewId>
												<ViewIds>{6565771e-caa5-ec11-983f-0022489b7ae7}</ViewIds>
												<RelationshipName>talxis_account_talxis_subscription_subscriptionproviderid</RelationshipName>
											</parameters>
										</control>
									</cell>
								</row>
							</rows>
						</section>
						<section name="leasseesection" id="{96362644-6aed-44a4-bd36-c83e9d7af6de}" IsUserDefined="0" locklevel="0" showlabel="true" showbar="false" layout="varwidth" celllabelalignment="Left" celllabelposition="Left" columns="1" labelwidth="115">
							<labels>
								<label description="NÁJEMCE" languagecode="1029" />
								<label description="LEASSEE" languagecode="1033" />
							</labels>
							<rows>
								<row>
									<cell locklevel="0" id="{eb63ce04-162b-4348-b03a-4b1c92872c92}" showlabel="false" rowspan="12" colspan="1" auto="false">
										<labels>
											<label description="Leassee" languagecode="1033" />
											<label description="Nájemce" languagecode="1029" />
										</labels>
										<control indicationOfSubgrid="true" id="leasseesubgrid" classid="{E7A81278-8635-4D9E-8D4D-59480B391C5B}" uniqueid="{42aa9c39-750d-4713-b62d-4d2c18654f71}">
											<parameters>
												<RecordsPerPage>100</RecordsPerPage>
												<AutoExpand>Fixed</AutoExpand>
												<EnableQuickFind>false</EnableQuickFind>
												<EnableViewPicker>false</EnableViewPicker>
												<EnableChartPicker>true</EnableChartPicker>
												<ChartGridMode>All</ChartGridMode>
												<TargetEntityType>talxis_subscription</TargetEntityType>
												<ViewId>{6565771e-caa5-ec11-983f-0022489b7ae7}</ViewId>
												<ViewIds>{6565771e-caa5-ec11-983f-0022489b7ae7}</ViewIds>
												<RelationshipName>talxis_account_talxis_subscription_accountid</RelationshipName>
											</parameters>
										</control>
									</cell>
								</row>
							</rows>
						</section>
					</sections>
				</column>
			</columns>
		</tab>
		<tab name="AuditTab" id="{e8376260-9d27-43ff-936e-62a88d69cae6}" IsUserDefined="0" locklevel="0" showlabel="true">
			<labels>
				<label description="📖 Historie změn" languagecode="1029" />
				<label description="📖 Change History" languagecode="1033" />
			</labels>
			<columns>
				<column width="100%">
					<sections>
						<section name="auditsection" id="{532f2734-9358-4e7e-a4a3-3965d363fb10}" IsUserDefined="0" locklevel="0" showlabel="false" showbar="false" layout="varwidth" celllabelalignment="Left" celllabelposition="Left" columns="1" labelwidth="115">
							<labels>
								<label description="Audit Section" languagecode="1033" />
							</labels>
							<rows>
								<row>
									<cell id="{86d43ad4-2e18-4fee-b4e8-45e013570f39}" locklevel="0" colspan="1" rowspan="1" showlabel="false" visible="false">
										<labels>
											<label description="Account ID" languagecode="1033" />
											<label description="Obchodní vztah" languagecode="1029" />
										</labels>
										<control id="accountid" classid="{4273EDBD-AC1D-40d3-9FB2-095C621B552D}" datafieldname="accountid" disabled="false" uniqueid="{f08d675a-742b-4591-9e70-62c49b24ca18}" />
									</cell>
								</row>
								<row>
									<cell id="{ab38bdf7-db7f-4ac2-b254-8ea495bd59ed}" locklevel="0" colspan="1" rowspan="1" showlabel="false">
										<labels>
											<label description="Audit Control" languagecode="1033" />
											<label description="Hlavní email" languagecode="1029" />
										</labels>
										<control id="talxis_emailaddress1" classid="{F9A8A302-114E-466A-B582-6771B2AE0D92}" datafieldname="talxis_emailaddress1" disabled="false" uniqueid="{bf29310b-1c57-4372-b2dd-8a806a2a57c7}" />
									</cell>
								</row>
							</rows>
						</section>
					</sections>
				</column>
			</columns>
		</tab>
	</tabs>
	<header id="{e5de9133-c83c-4ad5-aa2a-b98a942d57e8}" columns="111">
		<rows>
			<row>
				<cell id="{e4939353-70ff-4f9a-b267-2270aa9c91bf}" showlabel="true" locklevel="0">
					<labels>
						<label description="National Identification Number" languagecode="1033" />
						<label description="IČ" languagecode="1029" />
					</labels>
					<control id="header_talxis_nationalidentificationnumber" classid="{4273EDBD-AC1D-40d3-9FB2-095C621B552D}" datafieldname="talxis_nationalidentificationnumber" disabled="true" />
				</cell>
				<cell id="{952841d4-1edd-4425-896b-e9157509578a}" showlabel="true" locklevel="0">
					<labels>
						<label description="Tax Identification Number" languagecode="1033" />
						<label description="DIČ" languagecode="1029" />
					</labels>
					<control id="header_talxis_taxidentificationnumber" classid="{4273EDBD-AC1D-40d3-9FB2-095C621B552D}" datafieldname="talxis_taxidentificationnumber" disabled="true" />
				</cell>
				<cell id="{73cfc1be-239e-4acb-8eb0-10321aa0b2f4}" showlabel="true" locklevel="0">
					<labels>
						<label description="Connected to the registry" languagecode="1033" />
						<label description="Napojeno do registru" languagecode="1029" />
					</labels>
					<control id="header_ntg_connectedtoregisters" classid="{67FAC785-CD58-4f9f-ABB3-4B7DDC6ED5ED}" datafieldname="ntg_connectedtoregisters" disabled="true" uniqueid="{f8f0baba-9c6a-4e00-a9d5-336e54bf20c4}" />
				</cell>
				<cell id="{4f254e53-8a4d-47a1-aac4-fbeb8ea8fd26}" showlabel="true" locklevel="0">
					<labels>
						<label description="Owner" languagecode="1033" />
						<label description="Vlastník" languagecode="1029" />
					</labels>
					<control id="header_talxis_ownerprincipalid" classid="{270BD3DB-D9AF-4782-9025-509E298DEC0A}" datafieldname="talxis_ownerprincipalid" disabled="false" />
				</cell>
			</row>
		</rows>
	</header>
	<Navigation>
		<NavBarAreas>
			<NavBarArea Id="Info">
				<Titles>
					<Title LCID="1033" Text="Common" />
				</Titles>
			</NavBarArea>
			<NavBarArea Id="Sales">
				<Titles>
					<Title LCID="1033" Text="Sales" />
				</Titles>
			</NavBarArea>
			<NavBarArea Id="Service">
				<Titles>
					<Title LCID="1033" Text="Service" />
				</Titles>
			</NavBarArea>
			<NavBarArea Id="Marketing">
				<Titles>
					<Title LCID="1033" Text="Marketing" />
				</Titles>
			</NavBarArea>
			<NavBarArea Id="ProcessCenter">
				<Titles>
					<Title LCID="1033" Text="Process Sessions" />
				</Titles>
			</NavBarArea>
		</NavBarAreas>
	</Navigation>
	<controlDescriptions>
		<controlDescription forControl="{f8f0baba-9c6a-4e00-a9d5-336e54bf20c4}">
			<customControl id="{3EF39988-22BB-4F0B-BBBE-64B5A3748AEE}">
				<parameters>
					<datafieldname>ntg_connectedtoregisters</datafieldname>
				</parameters>
			</customControl>
			<customControl formFactor="2" name="talxis_TALXIS.PCF.ColorfulOptionSet">
				<parameters>
					<optionsInput>ntg_connectedtoregisters</optionsInput>
					<useColorBackground type="Enum" static="true">true</useColorBackground>
				</parameters>
			</customControl>
			<customControl formFactor="1" name="talxis_TALXIS.PCF.ColorfulOptionSet">
				<parameters>
					<optionsInput>ntg_connectedtoregisters</optionsInput>
					<useColorBackground type="Enum" static="true">true</useColorBackground>
				</parameters>
			</customControl>
			<customControl formFactor="0" name="talxis_TALXIS.PCF.ColorfulOptionSet">
				<parameters>
					<optionsInput>ntg_connectedtoregisters</optionsInput>
					<useColorBackground type="Enum" static="true">true</useColorBackground>
				</parameters>
			</customControl>
		</controlDescription>
		<controlDescription forControl="{9e3e26b6-8c23-493c-9d44-46c4dff37817}">
			<customControl id="{4273EDBD-AC1D-40D3-9FB2-095C621B552D}">
				<parameters>
					<datafieldname>ntg_relationshippcf</datafieldname>
				</parameters>
			</customControl>
			<customControl name="talxis_TALXIS.PCF.TreeView" formFactor="0">
				<parameters>
					<bindingField>ntg_relationshippcf</bindingField>
					<strictCheck static="true" type="Whole.None">0</strictCheck>
					<entityName static="true" type="SingleLine.Text">ntg_relationship</entityName>
					<entityDisplayFieldName static="true" type="SingleLine.Text">ntg_name</entityDisplayFieldName>
					<targetRecordsFetchXmlFilter static="true" type="SingleLine.Text">&lt;filter type="or"&gt;&lt;condition attribute="talxis_interceptor_placeholder" operator="ne" value="$securityTeamInterceptor$ {&amp;quot;attribute&amp;quot;: &amp;quot;ntg_securityteamid&amp;quot;}" /&gt;&lt;/filter&gt;</targetRecordsFetchXmlFilter>
					<associationEntityName static="true" type="SingleLine.Text">ntg_accountrelationshipconnection</associationEntityName>
					<useCustomIntersectingEntity static="true" type="Enum">1</useCustomIntersectingEntity>
					<intersectingEntitySourceLookup static="true" type="SingleLine.Text">ntg_accountid</intersectingEntitySourceLookup>
					<intersectingEntityTargetLookup static="true" type="SingleLine.Text">ntg_relationshipid</intersectingEntityTargetLookup>
					<connectionType static="true" type="SingleLine.Text">ntg_connectiontype</connectionType>
					<hiearchyParentFieldName static="true" type="SingleLine.Text">ntg_parentrelationshipid</hiearchyParentFieldName>
					<expandLevels static="true" type="Whole.None">2</expandLevels>
					<promptStatus static="true" type="Enum">true</promptStatus>
					<onChangeEventName static="true" type="SingleLine.Text">__onTreeViewChange</onChangeEventName>
				</parameters>
			</customControl>
			<customControl name="talxis_TALXIS.PCF.TreeView" formFactor="1">
				<parameters>
					<bindingField>ntg_relationshippcf</bindingField>
					<strictCheck static="true" type="Whole.None">0</strictCheck>
					<entityName static="true" type="SingleLine.Text">ntg_relationship</entityName>
					<entityDisplayFieldName static="true" type="SingleLine.Text">ntg_name</entityDisplayFieldName>
					<targetRecordsFetchXmlFilter static="true" type="SingleLine.Text">&lt;filter type="or"&gt;&lt;condition attribute="talxis_interceptor_placeholder" operator="ne" value="$securityTeamInterceptor$ {&amp;quot;attribute&amp;quot;: &amp;quot;ntg_securityteamid&amp;quot;}" /&gt;&lt;/filter&gt;</targetRecordsFetchXmlFilter>
					<associationEntityName static="true" type="SingleLine.Text">ntg_accountrelationshipconnection</associationEntityName>
					<useCustomIntersectingEntity static="true" type="Enum">1</useCustomIntersectingEntity>
					<intersectingEntitySourceLookup static="true" type="SingleLine.Text">ntg_accountid</intersectingEntitySourceLookup>
					<intersectingEntityTargetLookup static="true" type="SingleLine.Text">ntg_relationshipid</intersectingEntityTargetLookup>
					<connectionType static="true" type="SingleLine.Text">ntg_connectiontype</connectionType>
					<hiearchyParentFieldName static="true" type="SingleLine.Text">ntg_parentrelationshipid</hiearchyParentFieldName>
					<expandLevels static="true" type="Whole.None">2</expandLevels>
					<promptStatus static="true" type="Enum">true</promptStatus>
					<onChangeEventName static="true" type="SingleLine.Text">__onTreeViewChange</onChangeEventName>
				</parameters>
			</customControl>
			<customControl name="talxis_TALXIS.PCF.TreeView" formFactor="2">
				<parameters>
					<bindingField>ntg_relationshippcf</bindingField>
					<strictCheck static="true" type="Whole.None">0</strictCheck>
					<entityName static="true" type="SingleLine.Text">ntg_relationship</entityName>
					<entityDisplayFieldName static="true" type="SingleLine.Text">ntg_name</entityDisplayFieldName>
					<targetRecordsFetchXmlFilter static="true" type="SingleLine.Text">&lt;filter type="or"&gt;&lt;condition attribute="talxis_interceptor_placeholder" operator="ne" value="$securityTeamInterceptor$ {&amp;quot;attribute&amp;quot;: &amp;quot;ntg_securityteamid&amp;quot;}" /&gt;&lt;/filter&gt;</targetRecordsFetchXmlFilter>
					<associationEntityName static="true" type="SingleLine.Text">ntg_accountrelationshipconnection</associationEntityName>
					<useCustomIntersectingEntity static="true" type="Enum">1</useCustomIntersectingEntity>
					<intersectingEntitySourceLookup static="true" type="SingleLine.Text">ntg_accountid</intersectingEntitySourceLookup>
					<intersectingEntityTargetLookup static="true" type="SingleLine.Text">ntg_relationshipid</intersectingEntityTargetLookup>
					<connectionType static="true" type="SingleLine.Text">ntg_connectiontype</connectionType>
					<hiearchyParentFieldName static="true" type="SingleLine.Text">ntg_parentrelationshipid</hiearchyParentFieldName>
					<expandLevels static="true" type="Whole.None">2</expandLevels>
					<promptStatus static="true" type="Enum">true</promptStatus>
					<onChangeEventName static="true" type="SingleLine.Text">__onTreeViewChange</onChangeEventName>
				</parameters>
			</customControl>
		</controlDescription>
		<controlDescription forControl="{1ebdbc04-4624-4014-81e7-e734c48bfe55}">
			<customControl id="{3EF39988-22BB-4F0B-BBBE-64B5A3748AEE}">
				<parameters>
					<datafieldname>talxis_czvatregisterstatus</datafieldname>
				</parameters>
			</customControl>
			<customControl formFactor="2" name="talxis_TALXIS.PCF.ColorfulOptionSet">
				<parameters>
					<optionsInput>talxis_czvatregisterstatus</optionsInput>
					<optionsIconJSON type="SingleLine.Text" static="true">{"Accept":"742070000","ErrorBadge":"742070001","Error":"742070002"}</optionsIconJSON>
					<useColorBackground type="Enum" static="true">true</useColorBackground>
				</parameters>
			</customControl>
			<customControl formFactor="1" name="talxis_TALXIS.PCF.ColorfulOptionSet">
				<parameters>
					<optionsInput>talxis_czvatregisterstatus</optionsInput>
					<optionsIconJSON type="SingleLine.Text" static="true">{"Accept":"742070000","ErrorBadge":"742070001","Error":"742070002"}</optionsIconJSON>
					<useColorBackground type="Enum" static="true">true</useColorBackground>
				</parameters>
			</customControl>
			<customControl formFactor="0" name="talxis_TALXIS.PCF.ColorfulOptionSet">
				<parameters>
					<optionsInput>talxis_czvatregisterstatus</optionsInput>
					<optionsIconJSON type="SingleLine.Text" static="true">{"Accept":"742070000","ErrorBadge":"742070001","Error":"742070002"}</optionsIconJSON>
					<useColorBackground type="Enum" static="true">true</useColorBackground>
				</parameters>
			</customControl>
		</controlDescription>
		<controlDescription forControl="{41274b18-92bc-4c6c-aeea-39a3a9129b6f}">
			<customControl id="{3EF39988-22BB-4F0B-BBBE-64B5A3748AEE}">
				<parameters>
					<datafieldname>talxis_insolvencytypecode</datafieldname>
				</parameters>
			</customControl>
			<customControl formFactor="2" name="talxis_TALXIS.PCF.ColorfulOptionSet">
				<parameters>
					<optionsInput>talxis_insolvencytypecode</optionsInput>
					<optionsIconJSON type="SingleLine.Text" static="true">{"ErrorBadge":"742070000","Accept":"742070001","Error":"742070002"}</optionsIconJSON>
					<useColorBackground type="Enum" static="true">true</useColorBackground>
				</parameters>
			</customControl>
			<customControl formFactor="1" name="talxis_TALXIS.PCF.ColorfulOptionSet">
				<parameters>
					<optionsInput>talxis_insolvencytypecode</optionsInput>
					<optionsIconJSON type="SingleLine.Text" static="true">{"ErrorBadge":"742070000","Accept":"742070001","Error":"742070002"}</optionsIconJSON>
					<useColorBackground type="Enum" static="true">true</useColorBackground>
				</parameters>
			</customControl>
			<customControl formFactor="0" name="talxis_TALXIS.PCF.ColorfulOptionSet">
				<parameters>
					<optionsInput>talxis_insolvencytypecode</optionsInput>
					<optionsIconJSON type="SingleLine.Text" static="true">{"ErrorBadge":"742070000","Accept":"742070001","Error":"742070002"}</optionsIconJSON>
					<useColorBackground type="Enum" static="true">true</useColorBackground>
				</parameters>
			</customControl>
		</controlDescription>
		<controlDescription forControl="{b69999f8-6809-4b96-9d73-8dc0b1b1868e}">
			<customControl id="{4273EDBD-AC1D-40D3-9FB2-095C621B552D}">
				<parameters>
					<datafieldname>talxis_peoplegridpcf</datafieldname>
				</parameters>
			</customControl>
			<customControl formFactor="0" name="ntg_PCT21016.PCF.PeopleGrid">
				<parameters>
					<bindingField>talxis_peoplegridpcf</bindingField>
					<enableFieldCommunication static="true" type="Enum">false</enableFieldCommunication>
					<isUserManagementEnabled static="true" type="Enum">true</isUserManagementEnabled>
					<accountId>accountid</accountId>
					<jurisdictionCode>talxis_jurisdictioncode</jurisdictionCode>
					<cinNumber>talxis_nationalidentificationnumber</cinNumber>
					<maxContactsPerPage static="true" type="Whole.None">10</maxContactsPerPage>
					<groupConfigurationJSON static="true" type="SingleLine.Text">{"groups":[{"groupName":{"1029":"Představenstvo / Dozorčí rada","1033":"Board of Directors / Supervisory Board"},"roles":["75f07d65-f689-ed11-81ac-6045bd8c5352","f23576c2-2ba9-ed11-aad1-0022489fd0f2"]}],"defaultGroup":{"groupName":{"1029":"Jiné","1033":"Other"}}}</groupConfigurationJSON>
				</parameters>
			</customControl>
			<customControl formFactor="1" name="ntg_PCT21016.PCF.PeopleGrid">
				<parameters>
					<bindingField>talxis_peoplegridpcf</bindingField>
					<enableFieldCommunication static="true" type="Enum">false</enableFieldCommunication>
					<isUserManagementEnabled static="true" type="Enum">true</isUserManagementEnabled>
					<accountId>accountid</accountId>
					<jurisdictionCode>talxis_jurisdictioncode</jurisdictionCode>
					<cinNumber>talxis_nationalidentificationnumber</cinNumber>
					<maxContactsPerPage static="true" type="Whole.None">10</maxContactsPerPage>
					<groupConfigurationJSON static="true" type="SingleLine.Text">{"groups":[{"groupName":{"1029":"Představenstvo / Dozorčí rada","1033":"Board of Directors / Supervisory Board"},"roles":["75f07d65-f689-ed11-81ac-6045bd8c5352","f23576c2-2ba9-ed11-aad1-0022489fd0f2"]}],"defaultGroup":{"groupName":{"1029":"Jiné","1033":"Other"}}}</groupConfigurationJSON>
				</parameters>
			</customControl>
			<customControl formFactor="2" name="ntg_PCT21016.PCF.PeopleGrid">
				<parameters>
					<bindingField>talxis_peoplegridpcf</bindingField>
					<enableFieldCommunication static="true" type="Enum">false</enableFieldCommunication>
					<isUserManagementEnabled static="true" type="Enum">true</isUserManagementEnabled>
					<accountId>accountid</accountId>
					<jurisdictionCode>talxis_jurisdictioncode</jurisdictionCode>
					<cinNumber>talxis_nationalidentificationnumber</cinNumber>
					<maxContactsPerPage static="true" type="Whole.None">10</maxContactsPerPage>
					<groupConfigurationJSON static="true" type="SingleLine.Text">{"groups":[{"groupName":{"1029":"Představenstvo / Dozorčí rada","1033":"Board of Directors / Supervisory Board"},"roles":["75f07d65-f689-ed11-81ac-6045bd8c5352","f23576c2-2ba9-ed11-aad1-0022489fd0f2"]}],"defaultGroup":{"groupName":{"1029":"Jiné","1033":"Other"}}}</groupConfigurationJSON>
				</parameters>
			</customControl>
		</controlDescription>
		<controlDescription forControl="{bf29310b-1c57-4372-b2dd-8a806a2a57c7}">
			<customControl id="{4273EDBD-AC1D-40d3-9FB2-095C621B552D}">
				<parameters>
					<datafieldname>talxis_emailaddress1</datafieldname>
				</parameters>
			</customControl>
			<customControl formFactor="0" name="talxis_TALXIS.PCF.AuditHistory">
				<parameters>
					<bindingField>talxis_emailaddress1</bindingField>
					<entityName static="true" type="SingleLine.Text">account</entityName>
					<entityId type="SingleLine.Text">accountid</entityId>
					<changedAttributesToShow static="true" type="SingleLine.Text">talxis_ownerprincipalid,talxis_grossrevenueupperbound,talxis_grossrevenuelowerbound,talxis_grossrevenuefromyear,numberofemployees,revenue,talxis_phonenumber1,alxis_emailaddress1,ntg_contactpersonmultitypecode,primarycontactid,talxis_insolvencytypecode,talxis_historicalnames,talxis_ismanualdata,talxis_jurisdictioncode,name,statecode,statuscode,talxis_internalid,talxis_nationalidentificationnumber,talxis_taxidentificationnumber,talxis_czvatregisterstatus,talxis_registrationcourt,talxis_dateestablished,talxis_czpublishedvatbankaccounts,primarycontactsection,parentaccountid,emailaddress1,phonenumber1,description,talxis_seataddressid,talxis_mailaddressid,websiteurl,talxis_emailaddress1,accountid,ntg_customerregisteredondate</changedAttributesToShow>
					<enableFiltering static="true" type="Enum">true</enableFiltering>
					<enableHistoryPreview static="true" type="Enum">false</enableHistoryPreview>
					<relatedRecordsQuery static="true" type="SingleLine.Text">talxis_account_talxis_contract_counterpartyid($select=talxis_name,talxis_internalid,talxis_contractnumber,talxis_contracttypecode,ntg_contractsubtypetypecode,_ntg_productid_value,_ntg_contractversionid_value,_talxis_proposerid_value,_talxis_securityteamid_value,_talxis_counterpartyid_value,_ntg_contactid_value,talxis_contractsenton,talxis_signedon,talxis_validfrom,talxis_validto,ntg_contractclosereasontypecode,ntg_communicationlanguagetypecode,_ntg_clientreportscountryid_value,_ntg_authorizedrepresentativeid_value,ntg_onlineshopwebsite,ntg_reportingperiodtypecode,_transactioncurrencyid_value,_ntg_dealercategoryid_value,ntg_doesvatrateapply,ntg_invoicematurityindays,ntg_monthlyfeeforauthorizedrepresentativetypecode,ntg_registeredondate,talxis_terminaterequestreceivedon,_ntg_pricelistheaderid_value),talxis_account_talxis_site_accountid($select=_talxis_accountid_value,talxis_siteid,_talxis_addressid_value,talxis_locationdetails,talxis_notificationemails_plain,_ntg_contactid_value,talxis_name),primarycontactid($select=gendercode,_ntg_lettersalutationid_value,_ntg_personstitleid_value,firstname,lastname,_ntg_personsdegreeid_value,ntg_czpublishedvatbankaccounts,address1_addressid,preferredcontactmethodcode,emailaddress1,talxis_phonenumber1,talxis_emailaddress1,mobilephone,talxis_portalaccessstatuscode,talxis_registeredondatetime,talxis_firstinvitesentondatetime,talxis_userprofileinfocompleted,talxis_lastsignedondatetime,talxis_lastinvitesentondatetime),ntg_account_talxis_recyclingamenity_accountid($select=_ntg_accountid_value,ntg_defaultunloadingamenity,ntg_enabledtoselect,statecode,statuscode,talxis_capacity,_talxis_capacityunitid_value,talxis_internlid,talxis_name,talxis_recyclingamenitytypecode,_talxis_siteid_value,talxis_validfrom,talxis_validto)</relatedRecordsQuery>
				</parameters>
			</customControl>
			<customControl formFactor="1" name="talxis_TALXIS.PCF.AuditHistory">
				<parameters>
					<bindingField>talxis_emailaddress1</bindingField>
					<entityName static="true" type="SingleLine.Text">account</entityName>
					<entityId type="SingleLine.Text">accountid</entityId>
					<changedAttributesToShow static="true" type="SingleLine.Text">talxis_ownerprincipalid,talxis_grossrevenueupperbound,talxis_grossrevenuelowerbound,talxis_grossrevenuefromyear,numberofemployees,revenue,talxis_phonenumber1,alxis_emailaddress1,ntg_contactpersonmultitypecode,primarycontactid,talxis_insolvencytypecode,talxis_historicalnames,talxis_ismanualdata,talxis_jurisdictioncode,name,statecode,statuscode,talxis_internalid,talxis_nationalidentificationnumber,talxis_taxidentificationnumber,talxis_czvatregisterstatus,talxis_registrationcourt,talxis_dateestablished,talxis_czpublishedvatbankaccounts,primarycontactsection,parentaccountid,emailaddress1,phonenumber1,description,talxis_seataddressid,talxis_mailaddressid,websiteurl,talxis_emailaddress1,accountid,ntg_customerregisteredondate</changedAttributesToShow>
					<enableFiltering static="true" type="Enum">true</enableFiltering>
					<enableHistoryPreview static="true" type="Enum">false</enableHistoryPreview>
					<relatedRecordsQuery static="true" type="SingleLine.Text">talxis_account_talxis_contract_counterpartyid($select=talxis_name,talxis_internalid,talxis_contractnumber,talxis_contracttypecode,ntg_contractsubtypetypecode,_ntg_productid_value,_ntg_contractversionid_value,_talxis_proposerid_value,_talxis_securityteamid_value,_talxis_counterpartyid_value,_ntg_contactid_value,talxis_contractsenton,talxis_signedon,talxis_validfrom,talxis_validto,ntg_contractclosereasontypecode,ntg_communicationlanguagetypecode,_ntg_clientreportscountryid_value,_ntg_authorizedrepresentativeid_value,ntg_onlineshopwebsite,ntg_reportingperiodtypecode,_transactioncurrencyid_value,_ntg_dealercategoryid_value,ntg_doesvatrateapply,ntg_invoicematurityindays,ntg_monthlyfeeforauthorizedrepresentativetypecode,ntg_registeredondate,talxis_terminaterequestreceivedon,_ntg_pricelistheaderid_value),talxis_account_talxis_site_accountid($select=_talxis_accountid_value,talxis_siteid,_talxis_addressid_value,talxis_locationdetails,talxis_notificationemails_plain,_ntg_contactid_value,talxis_name),primarycontactid($select=gendercode,_ntg_lettersalutationid_value,_ntg_personstitleid_value,firstname,lastname,_ntg_personsdegreeid_value,ntg_czpublishedvatbankaccounts,address1_addressid,preferredcontactmethodcode,emailaddress1,talxis_phonenumber1,talxis_emailaddress1,mobilephone,talxis_portalaccessstatuscode,talxis_registeredondatetime,talxis_firstinvitesentondatetime,talxis_userprofileinfocompleted,talxis_lastsignedondatetime,talxis_lastinvitesentondatetime),ntg_account_talxis_recyclingamenity_accountid($select=_ntg_accountid_value,ntg_defaultunloadingamenity,ntg_enabledtoselect,statecode,statuscode,talxis_capacity,_talxis_capacityunitid_value,talxis_internlid,talxis_name,talxis_recyclingamenitytypecode,_talxis_siteid_value,talxis_validfrom,talxis_validto)</relatedRecordsQuery>
				</parameters>
			</customControl>
			<customControl formFactor="2" name="talxis_TALXIS.PCF.AuditHistory">
				<parameters>
					<bindingField>talxis_emailaddress1</bindingField>
					<entityName static="true" type="SingleLine.Text">account</entityName>
					<entityId type="SingleLine.Text">accountid</entityId>
					<changedAttributesToShow static="true" type="SingleLine.Text">talxis_ownerprincipalid,talxis_grossrevenueupperbound,talxis_grossrevenuelowerbound,talxis_grossrevenuefromyear,numberofemployees,revenue,talxis_phonenumber1,alxis_emailaddress1,ntg_contactpersonmultitypecode,primarycontactid,talxis_insolvencytypecode,talxis_historicalnames,talxis_ismanualdata,talxis_jurisdictioncode,name,statecode,statuscode,talxis_internalid,talxis_nationalidentificationnumber,talxis_taxidentificationnumber,talxis_czvatregisterstatus,talxis_registrationcourt,talxis_dateestablished,talxis_czpublishedvatbankaccounts,primarycontactsection,parentaccountid,emailaddress1,phonenumber1,description,talxis_seataddressid,talxis_mailaddressid,websiteurl,talxis_emailaddress1,accountid,ntg_customerregisteredondate</changedAttributesToShow>
					<enableFiltering static="true" type="Enum">true</enableFiltering>
					<enableHistoryPreview static="true" type="Enum">false</enableHistoryPreview>
					<relatedRecordsQuery static="true" type="SingleLine.Text">talxis_account_talxis_contract_counterpartyid($select=talxis_name,talxis_internalid,talxis_contractnumber,talxis_contracttypecode,ntg_contractsubtypetypecode,_ntg_productid_value,_ntg_contractversionid_value,_talxis_proposerid_value,_talxis_securityteamid_value,_talxis_counterpartyid_value,_ntg_contactid_value,talxis_contractsenton,talxis_signedon,talxis_validfrom,talxis_validto,ntg_contractclosereasontypecode,ntg_communicationlanguagetypecode,_ntg_clientreportscountryid_value,_ntg_authorizedrepresentativeid_value,ntg_onlineshopwebsite,ntg_reportingperiodtypecode,_transactioncurrencyid_value,_ntg_dealercategoryid_value,ntg_doesvatrateapply,ntg_invoicematurityindays,ntg_monthlyfeeforauthorizedrepresentativetypecode,ntg_registeredondate,talxis_terminaterequestreceivedon,_ntg_pricelistheaderid_value),talxis_account_talxis_site_accountid($select=_talxis_accountid_value,talxis_siteid,_talxis_addressid_value,talxis_locationdetails,talxis_notificationemails_plain,_ntg_contactid_value,talxis_name),primarycontactid($select=gendercode,_ntg_lettersalutationid_value,_ntg_personstitleid_value,firstname,lastname,_ntg_personsdegreeid_value,ntg_czpublishedvatbankaccounts,address1_addressid,preferredcontactmethodcode,emailaddress1,talxis_phonenumber1,talxis_emailaddress1,mobilephone,talxis_portalaccessstatuscode,talxis_registeredondatetime,talxis_firstinvitesentondatetime,talxis_userprofileinfocompleted,talxis_lastsignedondatetime,talxis_lastinvitesentondatetime),ntg_account_talxis_recyclingamenity_accountid($select=_ntg_accountid_value,ntg_defaultunloadingamenity,ntg_enabledtoselect,statecode,statuscode,talxis_capacity,_talxis_capacityunitid_value,talxis_internlid,talxis_name,talxis_recyclingamenitytypecode,_talxis_siteid_value,talxis_validfrom,talxis_validto)</relatedRecordsQuery>
				</parameters>
			</customControl>
		</controlDescription>
		<controlDescription forControl="{e9b885dd-cfb0-4ffa-8913-46e3293fb58d}">
			<customControl id="{270BD3DB-D9AF-4782-9025-509E298DEC0A}">
				<parameters>
					<datafieldname>talxis_mailaddressid</datafieldname>
				</parameters>
			</customControl>
			<customControl formFactor="0" name="talxis_TALXIS.PCF.QuickLookupSimpleEdit">
				<parameters>
					<bindingField>talxis_mailaddressid</bindingField>
					<customButtonIcon static="true" type="SingleLine.Text">POI</customButtonIcon>
					<customButtonUrl static="true" type="SingleLine.Text">https://www.google.com/maps/search/?api=1&amp;query={{talxis_lat }},{{ talxis_long }}</customButtonUrl>
					<enableCopyButton static="true" type="SingleLine.Text">true</enableCopyButton>
					<formId static="true" type="SingleLine.Text">0f98e335-c08a-4921-b925-09ef9a517c12</formId>
					<openFormWidth static="true" type="Whole.None">60</openFormWidth>
				</parameters>
			</customControl>
			<customControl formFactor="1" name="talxis_TALXIS.PCF.QuickLookupSimpleEdit">
				<parameters>
					<bindingField>talxis_mailaddressid</bindingField>
					<customButtonIcon static="true" type="SingleLine.Text">POI</customButtonIcon>
					<customButtonUrl static="true" type="SingleLine.Text">https://www.google.com/maps/search/?api=1&amp;query={{talxis_lat }},{{ talxis_long }}</customButtonUrl>
					<enableCopyButton static="true" type="SingleLine.Text">true</enableCopyButton>
					<formId static="true" type="SingleLine.Text">0f98e335-c08a-4921-b925-09ef9a517c12</formId>
					<openFormWidth static="true" type="Whole.None">60</openFormWidth>
				</parameters>
			</customControl>
			<customControl formFactor="2" name="talxis_TALXIS.PCF.QuickLookupSimpleEdit">
				<parameters>
					<bindingField>talxis_mailaddressid</bindingField>
					<customButtonIcon static="true" type="SingleLine.Text">POI</customButtonIcon>
					<customButtonUrl static="true" type="SingleLine.Text">https://www.google.com/maps/search/?api=1&amp;query={{talxis_lat }},{{ talxis_long }}</customButtonUrl>
					<enableCopyButton static="true" type="SingleLine.Text">true</enableCopyButton>
					<formId static="true" type="SingleLine.Text">0f98e335-c08a-4921-b925-09ef9a517c12</formId>
					<openFormWidth static="true" type="Whole.None">60</openFormWidth>
				</parameters>
			</customControl>
		</controlDescription>
		<controlDescription forControl="{5506adcc-6593-409e-b9b6-1f0ed388fef9}">
			<customControl id="{270BD3DB-D9AF-4782-9025-509E298DEC0A}">
				<parameters>
					<datafieldname>talxis_seataddressid</datafieldname>
				</parameters>
			</customControl>
			<customControl formFactor="0" name="talxis_TALXIS.PCF.QuickLookupSimpleEdit">
				<parameters>
					<bindingField>talxis_seataddressid</bindingField>
					<customButtonIcon static="true" type="SingleLine.Text">POI</customButtonIcon>
					<customButtonUrl static="true" type="SingleLine.Text">https://www.google.com/maps/search/?api=1&amp;query={{talxis_lat }},{{ talxis_long }}</customButtonUrl>
					<enableCopyButton static="true" type="SingleLine.Text">true</enableCopyButton>
					<formId static="true" type="SingleLine.Text">0f98e335-c08a-4921-b925-09ef9a517c12</formId>
					<openFormWidth static="true" type="Whole.None">60</openFormWidth>
				</parameters>
			</customControl>
			<customControl formFactor="1" name="talxis_TALXIS.PCF.QuickLookupSimpleEdit">
				<parameters>
					<bindingField>talxis_seataddressid</bindingField>
					<customButtonIcon static="true" type="SingleLine.Text">POI</customButtonIcon>
					<customButtonUrl static="true" type="SingleLine.Text">https://www.google.com/maps/search/?api=1&amp;query={{talxis_lat }},{{ talxis_long }}</customButtonUrl>
					<enableCopyButton static="true" type="SingleLine.Text">true</enableCopyButton>
					<formId static="true" type="SingleLine.Text">0f98e335-c08a-4921-b925-09ef9a517c12</formId>
					<openFormWidth static="true" type="Whole.None">60</openFormWidth>
				</parameters>
			</customControl>
			<customControl formFactor="2" name="talxis_TALXIS.PCF.QuickLookupSimpleEdit">
				<parameters>
					<bindingField>talxis_seataddressid</bindingField>
					<customButtonIcon static="true" type="SingleLine.Text">POI</customButtonIcon>
					<customButtonUrl static="true" type="SingleLine.Text">https://www.google.com/maps/search/?api=1&amp;query={{talxis_lat }},{{ talxis_long }}</customButtonUrl>
					<enableCopyButton static="true" type="SingleLine.Text">true</enableCopyButton>
					<formId static="true" type="SingleLine.Text">0f98e335-c08a-4921-b925-09ef9a517c12</formId>
					<openFormWidth static="true" type="Whole.None">60</openFormWidth>
				</parameters>
			</customControl>
		</controlDescription>
		<controlDescription forControl="{803b4949-0c69-44a3-a348-44dbfdf23906}">
			<customControl id="{4273EDBD-AC1D-40d3-9FB2-095C621B552D}">
				<parameters>
					<datafieldname>name</datafieldname>
				</parameters>
			</customControl>
			<customControl name="talxis_TALXIS.PCF.CompanyProfileHinting" formFactor="0">
				<parameters>
					<name>name</name>
					<companyNumber>talxis_nationalidentificationnumber</companyNumber>
					<historicalNames>talxis_historicalnames</historicalNames>
					<jurisdictionCode>talxis_jurisdictioncode</jurisdictionCode>
					<vatNumber>talxis_taxidentificationnumber</vatNumber>
					<reliableVATPayer>talxis_czvatregisterstatus</reliableVATPayer>
					<insolvency>talxis_insolvencytypecode</insolvency>
					<locality>address1_city</locality>
					<sublocality>talxis_sublocality</sublocality>
					<region>address1_stateorprovince</region>
					<formattedPostalCode>address1_postalcode</formattedPostalCode>
					<country>address1_country</country>
					<administrativeArea>talxis_administrativearea</administrativeArea>
					<streetName>address1_line1</streetName>
					<streetNumber>address1_line2</streetNumber>
					<fullAddress>talxis_fulladdress</fullAddress>
					<latitude>talxis_latitude</latitude>
					<longitude>talxis_longitude</longitude>
					<manualInput>talxis_ismanualdata</manualInput>
				</parameters>
			</customControl>
			<customControl name="talxis_TALXIS.PCF.CompanyProfileHinting" formFactor="1">
				<parameters>
					<name>name</name>
					<companyNumber>talxis_nationalidentificationnumber</companyNumber>
					<historicalNames>talxis_historicalnames</historicalNames>
					<jurisdictionCode>talxis_jurisdictioncode</jurisdictionCode>
					<vatNumber>talxis_taxidentificationnumber</vatNumber>
					<reliableVATPayer>talxis_czvatregisterstatus</reliableVATPayer>
					<insolvency>talxis_insolvencytypecode</insolvency>
					<locality>address1_city</locality>
					<sublocality>talxis_sublocality</sublocality>
					<region>address1_stateorprovince</region>
					<formattedPostalCode>address1_postalcode</formattedPostalCode>
					<country>address1_country</country>
					<administrativeArea>talxis_administrativearea</administrativeArea>
					<streetName>address1_line1</streetName>
					<streetNumber>address1_line2</streetNumber>
					<fullAddress>talxis_fulladdress</fullAddress>
					<latitude>talxis_latitude</latitude>
					<longitude>talxis_longitude</longitude>
					<manualInput>talxis_ismanualdata</manualInput>
				</parameters>
			</customControl>
			<customControl name="talxis_TALXIS.PCF.CompanyProfileHinting" formFactor="2">
				<parameters>
					<name>name</name>
					<companyNumber>talxis_nationalidentificationnumber</companyNumber>
					<historicalNames>talxis_historicalnames</historicalNames>
					<jurisdictionCode>talxis_jurisdictioncode</jurisdictionCode>
					<vatNumber>talxis_taxidentificationnumber</vatNumber>
					<reliableVATPayer>talxis_czvatregisterstatus</reliableVATPayer>
					<insolvency>talxis_insolvencytypecode</insolvency>
					<locality>address1_city</locality>
					<sublocality>talxis_sublocality</sublocality>
					<region>address1_stateorprovince</region>
					<formattedPostalCode>address1_postalcode</formattedPostalCode>
					<country>address1_country</country>
					<administrativeArea>talxis_administrativearea</administrativeArea>
					<streetName>address1_line1</streetName>
					<streetNumber>address1_line2</streetNumber>
					<fullAddress>talxis_fulladdress</fullAddress>
					<latitude>talxis_latitude</latitude>
					<longitude>talxis_longitude</longitude>
					<manualInput>talxis_ismanualdata</manualInput>
				</parameters>
			</customControl>
		</controlDescription>
		<controlDescription forControl="{681bf1e4-9b93-457c-90fa-8390c61cd78f}">
			<customControl id="{4273EDBD-AC1D-40d3-9FB2-095C621B552D}">
				<parameters>
					<datafieldname>talxis_emailaddress1</datafieldname>
				</parameters>
			</customControl>
			<customControl formFactor="0" name="talxis_TALXIS.PCF.EmailPicker">
				<parameters>
					<data>talxis_emailaddress1</data>
					<entityName static="true" type="SingleLine.Text">account</entityName>
					<recordId type="SingleLine.Text">accountid</recordId>
					<minEmailCount static="true" type="Whole.None">0</minEmailCount>
					<maxEmailCount static="true" type="Whole.None">1</maxEmailCount>
					<verificationFeature static="true" type="Enum">0</verificationFeature>
					<plainEmail>emailaddress1</plainEmail>
				</parameters>
			</customControl>
			<customControl formFactor="1" name="talxis_TALXIS.PCF.EmailPicker">
				<parameters>
					<data>talxis_emailaddress1</data>
					<entityName static="true" type="SingleLine.Text">account</entityName>
					<recordId type="SingleLine.Text">accountid</recordId>
					<minEmailCount static="true" type="Whole.None">0</minEmailCount>
					<maxEmailCount static="true" type="Whole.None">1</maxEmailCount>
					<verificationFeature static="true" type="Enum">0</verificationFeature>
					<plainEmail>emailaddress1</plainEmail>
				</parameters>
			</customControl>
			<customControl formFactor="2" name="talxis_TALXIS.PCF.EmailPicker">
				<parameters>
					<data>talxis_emailaddress1</data>
					<entityName static="true" type="SingleLine.Text">account</entityName>
					<recordId type="SingleLine.Text">accountid</recordId>
					<minEmailCount static="true" type="Whole.None">0</minEmailCount>
					<maxEmailCount static="true" type="Whole.None">1</maxEmailCount>
					<verificationFeature static="true" type="Enum">0</verificationFeature>
					<plainEmail>emailaddress1</plainEmail>
				</parameters>
			</customControl>
		</controlDescription>
		<controlDescription forControl="{447d0dd2-6f6b-4732-9cbd-7bc47d181618}">
			<customControl id="{4273EDBD-AC1D-40d3-9FB2-095C621B552D}">
				<parameters>
					<datafieldname>websiteurl</datafieldname>
				</parameters>
			</customControl>
			<customControl formFactor="0" name="talxis_TALXIS.PCF.UrlPicker">
				<parameters>
					<URL>websiteurl</URL>
				</parameters>
			</customControl>
			<customControl formFactor="1" name="talxis_TALXIS.PCF.UrlPicker">
				<parameters>
					<URL>websiteurl</URL>
				</parameters>
			</customControl>
			<customControl formFactor="2" name="talxis_TALXIS.PCF.UrlPicker">
				<parameters>
					<URL>websiteurl</URL>
				</parameters>
			</customControl>
		</controlDescription>
		<controlDescription forControl="{66f7d318-8245-458c-88a8-3f19d9a103a9}">
			<customControl id="{4273EDBD-AC1D-40d3-9FB2-095C621B552D}">
				<parameters>
					<datafieldname>ntg_eshopwebsiteurl</datafieldname>
				</parameters>
			</customControl>
			<customControl formFactor="0" name="talxis_TALXIS.PCF.UrlPicker">
				<parameters>
					<URL>ntg_eshopwebsiteurl</URL>
				</parameters>
			</customControl>
			<customControl formFactor="1" name="talxis_TALXIS.PCF.UrlPicker">
				<parameters>
					<URL>ntg_eshopwebsiteurl</URL>
				</parameters>
			</customControl>
			<customControl formFactor="2" name="talxis_TALXIS.PCF.UrlPicker">
				<parameters>
					<URL>ntg_eshopwebsiteurl</URL>
				</parameters>
			</customControl>
		</controlDescription>
		<controlDescription forControl="{9b0335b7-f5a5-4929-af93-4f690ebc9047}">
			<customControl id="{4273EDBD-AC1D-40d3-9FB2-095C621B552D}">
				<parameters>
					<datafieldname>ntg_carriernotificationemail</datafieldname>
				</parameters>
			</customControl>
			<customControl formFactor="0" name="talxis_TALXIS.PCF.EmailPicker">
				<parameters>
					<data>ntg_carriernotificationemail</data>
					<entityName static="true" type="SingleLine.Text">account</entityName>
					<recordId type="SingleLine.Text">accountid</recordId>
					<minEmailCount static="true" type="Whole.None">0</minEmailCount>
					<maxEmailCount static="true" type="Whole.None">10</maxEmailCount>
					<verificationFeature static="true" type="Enum">0</verificationFeature>
					<plainEmail>ntg_carriernotificationemail_plain</plainEmail>
				</parameters>
			</customControl>
			<customControl formFactor="1" name="talxis_TALXIS.PCF.EmailPicker">
				<parameters>
					<data>ntg_carriernotificationemail</data>
					<entityName static="true" type="SingleLine.Text">account</entityName>
					<recordId type="SingleLine.Text">accountid</recordId>
					<minEmailCount static="true" type="Whole.None">0</minEmailCount>
					<maxEmailCount static="true" type="Whole.None">10</maxEmailCount>
					<verificationFeature static="true" type="Enum">0</verificationFeature>
					<plainEmail>ntg_carriernotificationemail_plain</plainEmail>
				</parameters>
			</customControl>
			<customControl formFactor="2" name="talxis_TALXIS.PCF.EmailPicker">
				<parameters>
					<data>ntg_carriernotificationemail</data>
					<entityName static="true" type="SingleLine.Text">account</entityName>
					<recordId type="SingleLine.Text">accountid</recordId>
					<minEmailCount static="true" type="Whole.None">0</minEmailCount>
					<maxEmailCount static="true" type="Whole.None">10</maxEmailCount>
					<verificationFeature static="true" type="Enum">0</verificationFeature>
					<plainEmail>ntg_carriernotificationemail_plain</plainEmail>
				</parameters>
			</customControl>
		</controlDescription>
		<controlDescription forControl="{c4be975e-e6bf-46d5-8da2-0a8da536c90a}">
			<customControl id="{4273EDBD-AC1D-40d3-9FB2-095C621B552D}">
				<parameters>
					<datafieldname>ntg_wasteprocessornotificationemail</datafieldname>
				</parameters>
			</customControl>
			<customControl formFactor="0" name="talxis_TALXIS.PCF.EmailPicker">
				<parameters>
					<data>ntg_wasteprocessornotificationemail</data>
					<entityName static="true" type="SingleLine.Text">account</entityName>
					<recordId type="SingleLine.Text">accountid</recordId>
					<minEmailCount static="true" type="Whole.None">0</minEmailCount>
					<maxEmailCount static="true" type="Whole.None">10</maxEmailCount>
					<verificationFeature static="true" type="Enum">0</verificationFeature>
					<plainEmail>ntg_wasteprocessornotificationemail_plain</plainEmail>
				</parameters>
			</customControl>
			<customControl formFactor="1" name="talxis_TALXIS.PCF.EmailPicker">
				<parameters>
					<data>ntg_wasteprocessornotificationemail</data>
					<entityName static="true" type="SingleLine.Text">account</entityName>
					<recordId type="SingleLine.Text">accountid</recordId>
					<minEmailCount static="true" type="Whole.None">0</minEmailCount>
					<maxEmailCount static="true" type="Whole.None">10</maxEmailCount>
					<verificationFeature static="true" type="Enum">0</verificationFeature>
					<plainEmail>ntg_wasteprocessornotificationemail_plain</plainEmail>
				</parameters>
			</customControl>
			<customControl formFactor="2" name="talxis_TALXIS.PCF.EmailPicker">
				<parameters>
					<data>ntg_wasteprocessornotificationemail</data>
					<entityName static="true" type="SingleLine.Text">account</entityName>
					<recordId type="SingleLine.Text">accountid</recordId>
					<minEmailCount static="true" type="Whole.None">0</minEmailCount>
					<maxEmailCount static="true" type="Whole.None">10</maxEmailCount>
					<verificationFeature static="true" type="Enum">0</verificationFeature>
					<plainEmail>ntg_wasteprocessornotificationemail_plain</plainEmail>
				</parameters>
			</customControl>
		</controlDescription>
		<controlDescription forControl="{fda91d22-674b-42c2-a3a7-4e31b9013f2f}">
			<customControl id="{4273EDBD-AC1D-40d3-9FB2-095C621B552D}">
				<parameters>
					<datafieldname>talxis_phonenumber1</datafieldname>
				</parameters>
			</customControl>
			<customControl formFactor="0" name="talxis_TALXIS.PCF.PhonePicker">
				<parameters>
					<phoneNumber>talxis_phonenumber1</phoneNumber>
					<defaultCountryCode static="true" type="SingleLine.Text">CZ</defaultCountryCode>
					<placeholderMessage static="true" type="SingleLine.Text">---</placeholderMessage>
					<verificationFeature static="true" type="Enum">0</verificationFeature>
					<callFeature static="true" type="Enum">1</callFeature>
					<plainPhone>telephone1</plainPhone>
				</parameters>
			</customControl>
			<customControl formFactor="1" name="talxis_TALXIS.PCF.PhonePicker">
				<parameters>
					<phoneNumber>talxis_phonenumber1</phoneNumber>
					<defaultCountryCode static="true" type="SingleLine.Text">CZ</defaultCountryCode>
					<placeholderMessage static="true" type="SingleLine.Text">---</placeholderMessage>
					<verificationFeature static="true" type="Enum">0</verificationFeature>
					<callFeature static="true" type="Enum">1</callFeature>
					<plainPhone>telephone1</plainPhone>
				</parameters>
			</customControl>
			<customControl formFactor="2" name="talxis_TALXIS.PCF.PhonePicker">
				<parameters>
					<phoneNumber>talxis_phonenumber1</phoneNumber>
					<defaultCountryCode static="true" type="SingleLine.Text">CZ</defaultCountryCode>
					<placeholderMessage static="true" type="SingleLine.Text">---</placeholderMessage>
					<verificationFeature static="true" type="Enum">0</verificationFeature>
					<callFeature static="true" type="Enum">1</callFeature>
					<plainPhone>telephone1</plainPhone>
				</parameters>
			</customControl>
		</controlDescription>
		<controlDescription forControl="{5fe0b020-b212-4501-a439-1cd347a52271}">
			<customControl id="{E0DECE4B-6FC8-4a8f-A065-082708572369}">
				<parameters>
					<datafieldname>talxis_filecontrol</datafieldname>
				</parameters>
			</customControl>
			<customControl formFactor="0" name="talxis_TALXIS.PCF.FileExplorer">
				<parameters>
					<bindingField>talxis_filecontrol</bindingField>
					<collaborationWorkspaceId type="SingleLine.Text" static="true">53034b01-05ab-ee11-be37-000d3aba1742</collaborationWorkspaceId>
					<formId type="SingleLine.Text" static="true">6a72a270-9b64-4c01-a1ae-2941a9428a14</formId>
				</parameters>
			</customControl>
			<customControl formFactor="1" name="talxis_TALXIS.PCF.FileExplorer">
				<parameters>
					<bindingField>talxis_filecontrol</bindingField>
					<collaborationWorkspaceId type="SingleLine.Text" static="true">53034b01-05ab-ee11-be37-000d3aba1742</collaborationWorkspaceId>
					<formId type="SingleLine.Text" static="true">6a72a270-9b64-4c01-a1ae-2941a9428a14</formId>
				</parameters>
			</customControl>
			<customControl formFactor="2" name="talxis_TALXIS.PCF.FileExplorer">
				<parameters>
					<bindingField>talxis_filecontrol</bindingField>
					<collaborationWorkspaceId type="SingleLine.Text" static="true">53034b01-05ab-ee11-be37-000d3aba1742</collaborationWorkspaceId>
					<formId type="SingleLine.Text" static="true">6a72a270-9b64-4c01-a1ae-2941a9428a14</formId>
				</parameters>
			</customControl>
		</controlDescription>
		<controlDescription forControl="{9259e1fe-3fdf-4da9-8bfa-e412d3d4ead2}">
			<customControl id="{4273EDBD-AC1D-40D3-9FB2-095C621B552D}">
				<parameters>
					<datafieldname>talxis_timelinecontrolpcf</datafieldname>
				</parameters>
			</customControl>
			<customControl name="talxis_TALXIS.PCF.TimelineComponent" formFactor="1">
				<parameters>
					<bindingField type="SingleLine.Text">talxis_timelinecontrolpcf</bindingField>
					<enabledActivityTypeEntities type="SingleLine.Text" static="true">appointment,letter,talxis_activity_email,phonecall,task,talxis_internalnote,annotation</enabledActivityTypeEntities>
					<enableTypeFiltering type="SingleLine.Text" static="true">true</enableTypeFiltering>
					<enableDateFiltering type="SingleLine.Text" static="true">true</enableDateFiltering>
					<UserInterfaceType static="true" type="Enum">Feed</UserInterfaceType>
				</parameters>
			</customControl>
			<customControl name="talxis_TALXIS.PCF.TimelineComponent" formFactor="2">
				<parameters>
					<bindingField type="SingleLine.Text">talxis_timelinecontrolpcf</bindingField>
					<enabledActivityTypeEntities type="SingleLine.Text" static="true">appointment,letter,talxis_activity_email,phonecall,task,talxis_internalnote,annotation</enabledActivityTypeEntities>
					<enableTypeFiltering type="SingleLine.Text" static="true">true</enableTypeFiltering>
					<enableDateFiltering type="SingleLine.Text" static="true">true</enableDateFiltering>
					<UserInterfaceType static="true" type="Enum">Feed</UserInterfaceType>
				</parameters>
			</customControl>
			<customControl name="talxis_TALXIS.PCF.TimelineComponent" formFactor="0">
				<parameters>
					<bindingField type="SingleLine.Text">talxis_timelinecontrolpcf</bindingField>
					<enabledActivityTypeEntities type="SingleLine.Text" static="true">appointment,letter,talxis_activity_email,phonecall,task,talxis_internalnote,annotation</enabledActivityTypeEntities>
					<enableTypeFiltering type="SingleLine.Text" static="true">true</enableTypeFiltering>
					<enableDateFiltering type="SingleLine.Text" static="true">true</enableDateFiltering>
					<UserInterfaceType static="true" type="Enum">Feed</UserInterfaceType>
				</parameters>
			</customControl>
		</controlDescription>
		<controlDescription forControl="{08fa40cb-d5a7-4db4-89d4-b4be9f9a4837}">
			<customControl id="{270BD3DB-D9AF-4782-9025-509E298DEC0A}">
				<parameters>
					<datafieldname>ntg_requesttoisohelektroid</datafieldname>
				</parameters>
			</customControl>
			<customControl formFactor="0" name="MscrmControls.ModelForm.ModelFormControl">
				<parameters>
					<value>
						<BindAttribute>ntg_requesttoisohelektroid</BindAttribute>
						<DefaultViewId>{6dfcdd55-1437-466c-bb3a-ebbbf526e170}</DefaultViewId>
						<FilterRelationshipName />
						<DependentAttributeName />
						<DependentAttributeType />
						<AvailableViewIds />
						<AllowFilterOff>false</AllowFilterOff>
						<DisableQuickFind>false</DisableQuickFind>
						<DisableViewPicker>false</DisableViewPicker>
					</value>
					<QuickForms static="true" type="SingleLine.Text">&lt;QuickForms&gt;&lt;QuickFormIds&gt;&lt;QuickFormId entityname="ntg_isohrequest"&gt;8a0c9195-ff03-f011-bae3-000d3a68b8b4&lt;/QuickFormId&gt;&lt;/QuickFormIds&gt;&lt;/QuickForms</QuickForms>
					<SaveMode static="true" type="Enum">0</SaveMode>
					<EnableHighDensityPageHeader type="Enum" static="true">false</EnableHighDensityPageHeader>
					<DisplayFormSelector type="Enum" static="true">false</DisplayFormSelector>
					<AddToRecentItems type="Enum" static="true">false</AddToRecentItems>
				</parameters>
			</customControl>
			<customControl formFactor="1" name="MscrmControls.ModelForm.ModelFormControl">
				<parameters>
					<value>
						<BindAttribute>ntg_requesttoisohelektroid</BindAttribute>
						<DefaultViewId>{6dfcdd55-1437-466c-bb3a-ebbbf526e170}</DefaultViewId>
						<FilterRelationshipName />
						<DependentAttributeName />
						<DependentAttributeType />
						<AvailableViewIds />
						<AllowFilterOff>false</AllowFilterOff>
						<DisableQuickFind>false</DisableQuickFind>
						<DisableViewPicker>false</DisableViewPicker>
					</value>
					<QuickForms static="true" type="SingleLine.Text">&lt;QuickForms&gt;&lt;QuickFormIds&gt;&lt;QuickFormId entityname="ntg_isohrequest"&gt;8a0c9195-ff03-f011-bae3-000d3a68b8b4&lt;/QuickFormId&gt;&lt;/QuickFormIds&gt;&lt;/QuickForms</QuickForms>
					<SaveMode static="true" type="Enum">0</SaveMode>
					<EnableHighDensityPageHeader type="Enum" static="true">false</EnableHighDensityPageHeader>
					<DisplayFormSelector type="Enum" static="true">false</DisplayFormSelector>
					<AddToRecentItems type="Enum" static="true">false</AddToRecentItems>
				</parameters>
			</customControl>
			<customControl formFactor="2" name="MscrmControls.ModelForm.ModelFormControl">
				<parameters>
					<value>
						<BindAttribute>ntg_requesttoisohelektroid</BindAttribute>
						<DefaultViewId>{6dfcdd55-1437-466c-bb3a-ebbbf526e170}</DefaultViewId>
						<FilterRelationshipName />
						<DependentAttributeName />
						<DependentAttributeType />
						<AvailableViewIds />
						<AllowFilterOff>false</AllowFilterOff>
						<DisableQuickFind>false</DisableQuickFind>
						<DisableViewPicker>false</DisableViewPicker>
					</value>
					<QuickForms static="true" type="SingleLine.Text">&lt;QuickForms&gt;&lt;QuickFormIds&gt;&lt;QuickFormId entityname="ntg_isohrequest"&gt;8a0c9195-ff03-f011-bae3-000d3a68b8b4&lt;/QuickFormId&gt;&lt;/QuickFormIds&gt;&lt;/QuickForms</QuickForms>
					<SaveMode static="true" type="Enum">0</SaveMode>
					<EnableHighDensityPageHeader type="Enum" static="true">false</EnableHighDensityPageHeader>
					<DisplayFormSelector type="Enum" static="true">false</DisplayFormSelector>
					<AddToRecentItems type="Enum" static="true">false</AddToRecentItems>
				</parameters>
			</customControl>
		</controlDescription>
		<controlDescription forControl="{e657476b-f928-4513-92e7-32d0564c38ac}">
			<customControl id="{270BD3DB-D9AF-4782-9025-509E298DEC0A}">
				<parameters>
					<datafieldname>ntg_requesttoisohbatteryid</datafieldname>
				</parameters>
			</customControl>
			<customControl formFactor="0" name="MscrmControls.ModelForm.ModelFormControl">
				<parameters>
					<value>
						<BindAttribute>ntg_requesttoisohbatteryid</BindAttribute>
						<DefaultViewId>{6dfcdd55-1437-466c-bb3a-ebbbf526e170}</DefaultViewId>
						<FilterRelationshipName />
						<DependentAttributeName />
						<DependentAttributeType />
						<AvailableViewIds />
						<AllowFilterOff>false</AllowFilterOff>
						<DisableQuickFind>false</DisableQuickFind>
						<DisableViewPicker>false</DisableViewPicker>
					</value>
					<QuickForms static="true" type="SingleLine.Text">&lt;QuickForms&gt;&lt;QuickFormIds&gt;&lt;QuickFormId entityname="ntg_isohrequest"&gt;8a0c9195-ff03-f011-bae3-000d3a68b8b4&lt;/QuickFormId&gt;&lt;/QuickFormIds&gt;&lt;/QuickForms</QuickForms>
					<SaveMode static="true" type="Enum">0</SaveMode>
					<EnableHighDensityPageHeader type="Enum" static="true">false</EnableHighDensityPageHeader>
					<DisplayFormSelector type="Enum" static="true">false</DisplayFormSelector>
					<AddToRecentItems type="Enum" static="true">false</AddToRecentItems>
				</parameters>
			</customControl>
			<customControl formFactor="1" name="MscrmControls.ModelForm.ModelFormControl">
				<parameters>
					<value>
						<BindAttribute>ntg_requesttoisohbatteryid</BindAttribute>
						<DefaultViewId>{6dfcdd55-1437-466c-bb3a-ebbbf526e170}</DefaultViewId>
						<FilterRelationshipName />
						<DependentAttributeName />
						<DependentAttributeType />
						<AvailableViewIds />
						<AllowFilterOff>false</AllowFilterOff>
						<DisableQuickFind>false</DisableQuickFind>
						<DisableViewPicker>false</DisableViewPicker>
					</value>
					<QuickForms static="true" type="SingleLine.Text">&lt;QuickForms&gt;&lt;QuickFormIds&gt;&lt;QuickFormId entityname="ntg_isohrequest"&gt;8a0c9195-ff03-f011-bae3-000d3a68b8b4&lt;/QuickFormId&gt;&lt;/QuickFormIds&gt;&lt;/QuickForms</QuickForms>
					<SaveMode static="true" type="Enum">0</SaveMode>
					<EnableHighDensityPageHeader type="Enum" static="true">false</EnableHighDensityPageHeader>
					<DisplayFormSelector type="Enum" static="true">false</DisplayFormSelector>
					<AddToRecentItems type="Enum" static="true">false</AddToRecentItems>
				</parameters>
			</customControl>
			<customControl formFactor="2" name="MscrmControls.ModelForm.ModelFormControl">
				<parameters>
					<value>
						<BindAttribute>ntg_requesttoisohbatteryid</BindAttribute>
						<DefaultViewId>{6dfcdd55-1437-466c-bb3a-ebbbf526e170}</DefaultViewId>
						<FilterRelationshipName />
						<DependentAttributeName />
						<DependentAttributeType />
						<AvailableViewIds />
						<AllowFilterOff>false</AllowFilterOff>
						<DisableQuickFind>false</DisableQuickFind>
						<DisableViewPicker>false</DisableViewPicker>
					</value>
					<QuickForms static="true" type="SingleLine.Text">&lt;QuickForms&gt;&lt;QuickFormIds&gt;&lt;QuickFormId entityname="ntg_isohrequest"&gt;8a0c9195-ff03-f011-bae3-000d3a68b8b4&lt;/QuickFormId&gt;&lt;/QuickFormIds&gt;&lt;/QuickForms</QuickForms>
					<SaveMode static="true" type="Enum">0</SaveMode>
					<EnableHighDensityPageHeader type="Enum" static="true">false</EnableHighDensityPageHeader>
					<DisplayFormSelector type="Enum" static="true">false</DisplayFormSelector>
					<AddToRecentItems type="Enum" static="true">false</AddToRecentItems>
				</parameters>
			</customControl>
		</controlDescription>
		<controlDescription forControl="{c2ea0fe7-683f-4443-a9af-63e85429d58b}">
			<customControl id="{E7A81278-8635-4d9e-8D4D-59480B391C5B}" formFactor="0">
				<parameters>
					<SelectableRows type="SingleLine.Text" static="true">multiple</SelectableRows>
					<EnableNavigation type="SingleLine.Text" static="true">true</EnableNavigation>
					<EnableEditing type="SingleLine.Text" static="true">true</EnableEditing>
				</parameters>
			</customControl>
			<customControl id="{E7A81278-8635-4d9e-8D4D-59480B391C5B}" formFactor="1">
				<parameters>
					<SelectableRows type="SingleLine.Text" static="true">multiple</SelectableRows>
					<EnableNavigation type="SingleLine.Text" static="true">true</EnableNavigation>
					<EnableEditing type="SingleLine.Text" static="true">true</EnableEditing>
				</parameters>
			</customControl>
			<customControl id="{E7A81278-8635-4d9e-8D4D-59480B391C5B}" formFactor="2">
				<parameters>
					<SelectableRows type="SingleLine.Text" static="true">multiple</SelectableRows>
					<EnableNavigation type="SingleLine.Text" static="true">true</EnableNavigation>
					<EnableEditing type="SingleLine.Text" static="true">true</EnableEditing>
				</parameters>
			</customControl>
		</controlDescription>
		<controlDescription forControl="{c5c25a52-f05e-4152-9c80-692ebaf951a1}">
			<customControl id="{E7A81278-8635-4d9e-8D4D-59480B391C5B}" formFactor="0">
				<parameters>
					<SelectableRows type="SingleLine.Text" static="true">true</SelectableRows>
					<EnableNavigation type="SingleLine.Text" static="true">true</EnableNavigation>
				</parameters>
			</customControl>
			<customControl id="{E7A81278-8635-4d9e-8D4D-59480B391C5B}" formFactor="1">
				<parameters>
					<SelectableRows type="SingleLine.Text" static="true">true</SelectableRows>
					<EnableNavigation type="SingleLine.Text" static="true">true</EnableNavigation>
				</parameters>
			</customControl>
			<customControl id="{E7A81278-8635-4d9e-8D4D-59480B391C5B}" formFactor="2">
				<parameters>
					<SelectableRows type="SingleLine.Text" static="true">true</SelectableRows>
					<EnableNavigation type="SingleLine.Text" static="true">true</EnableNavigation>
				</parameters>
			</customControl>
		</controlDescription>
		<controlDescription forControl="{1fb47222-9823-4e14-bd71-59e8c45ddd1e}">
			<customControl id="{E7A81278-8635-4d9e-8D4D-59480B391C5B}" formFactor="0">
				<parameters>
					<SelectableRows type="SingleLine.Text" static="true">true</SelectableRows>
					<EnableNavigation type="SingleLine.Text" static="true">true</EnableNavigation>
				</parameters>
			</customControl>
			<customControl id="{E7A81278-8635-4d9e-8D4D-59480B391C5B}" formFactor="1">
				<parameters>
					<SelectableRows type="SingleLine.Text" static="true">true</SelectableRows>
					<EnableNavigation type="SingleLine.Text" static="true">true</EnableNavigation>
				</parameters>
			</customControl>
			<customControl id="{E7A81278-8635-4d9e-8D4D-59480B391C5B}" formFactor="2">
				<parameters>
					<SelectableRows type="SingleLine.Text" static="true">true</SelectableRows>
					<EnableNavigation type="SingleLine.Text" static="true">true</EnableNavigation>
				</parameters>
			</customControl>
		</controlDescription>
		<controlDescription forControl="{eb796b7b-52ae-4756-97d9-0a7cf61a2a3b}">
			<customControl id="{E7A81278-8635-4d9e-8D4D-59480B391C5B}" formFactor="0">
				<parameters>
					<SelectableRows type="SingleLine.Text" static="true">true</SelectableRows>
					<EnableNavigation type="SingleLine.Text" static="true">true</EnableNavigation>
				</parameters>
			</customControl>
			<customControl id="{E7A81278-8635-4d9e-8D4D-59480B391C5B}" formFactor="1">
				<parameters>
					<SelectableRows type="SingleLine.Text" static="true">true</SelectableRows>
					<EnableNavigation type="SingleLine.Text" static="true">true</EnableNavigation>
				</parameters>
			</customControl>
			<customControl id="{E7A81278-8635-4d9e-8D4D-59480B391C5B}" formFactor="2">
				<parameters>
					<SelectableRows type="SingleLine.Text" static="true">true</SelectableRows>
					<EnableNavigation type="SingleLine.Text" static="true">true</EnableNavigation>
				</parameters>
			</customControl>
		</controlDescription>
		<controlDescription forControl="{2db242fe-f3e9-4905-b66d-23ca6d576b80}">
			<customControl id="{E7A81278-8635-4d9e-8D4D-59480B391C5B}" formFactor="0">
				<parameters>
					<SelectableRows type="SingleLine.Text" static="true">true</SelectableRows>
					<EnableNavigation type="SingleLine.Text" static="true">true</EnableNavigation>
				</parameters>
			</customControl>
			<customControl id="{E7A81278-8635-4d9e-8D4D-59480B391C5B}" formFactor="1">
				<parameters>
					<SelectableRows type="SingleLine.Text" static="true">true</SelectableRows>
					<EnableNavigation type="SingleLine.Text" static="true">true</EnableNavigation>
				</parameters>
			</customControl>
			<customControl id="{E7A81278-8635-4d9e-8D4D-59480B391C5B}" formFactor="2">
				<parameters>
					<SelectableRows type="SingleLine.Text" static="true">true</SelectableRows>
					<EnableNavigation type="SingleLine.Text" static="true">true</EnableNavigation>
				</parameters>
			</customControl>
		</controlDescription>
		<controlDescription forControl="{7f357ed8-1176-4399-9e44-3fa3445a329b}">
			<customControl id="{E7A81278-8635-4d9e-8D4D-59480B391C5B}" formFactor="0">
				<parameters>
					<SelectableRows type="SingleLine.Text" static="true">true</SelectableRows>
					<EnableNavigation type="SingleLine.Text" static="true">true</EnableNavigation>
				</parameters>
			</customControl>
			<customControl id="{E7A81278-8635-4d9e-8D4D-59480B391C5B}" formFactor="1">
				<parameters>
					<SelectableRows type="SingleLine.Text" static="true">true</SelectableRows>
					<EnableNavigation type="SingleLine.Text" static="true">true</EnableNavigation>
				</parameters>
			</customControl>
			<customControl id="{E7A81278-8635-4d9e-8D4D-59480B391C5B}" formFactor="2">
				<parameters>
					<SelectableRows type="SingleLine.Text" static="true">true</SelectableRows>
					<EnableNavigation type="SingleLine.Text" static="true">true</EnableNavigation>
				</parameters>
			</customControl>
		</controlDescription>
		<controlDescription forControl="{7fc877e2-8b80-45c7-a205-8bed1f682c0d}">
			<customControl id="{E7A81278-8635-4d9e-8D4D-59480B391C5B}" formFactor="0">
				<parameters>
					<SelectableRows type="SingleLine.Text" static="true">true</SelectableRows>
					<EnableNavigation type="SingleLine.Text" static="true">true</EnableNavigation>
				</parameters>
			</customControl>
			<customControl id="{E7A81278-8635-4d9e-8D4D-59480B391C5B}" formFactor="1">
				<parameters>
					<SelectableRows type="SingleLine.Text" static="true">true</SelectableRows>
					<EnableNavigation type="SingleLine.Text" static="true">true</EnableNavigation>
				</parameters>
			</customControl>
			<customControl id="{E7A81278-8635-4d9e-8D4D-59480B391C5B}" formFactor="2">
				<parameters>
					<SelectableRows type="SingleLine.Text" static="true">true</SelectableRows>
					<EnableNavigation type="SingleLine.Text" static="true">true</EnableNavigation>
				</parameters>
			</customControl>
		</controlDescription>
		<controlDescription forControl="{019a7573-8bc0-4bc8-9609-d2102407594a}">
			<customControl id="{E7A81278-8635-4d9e-8D4D-59480B391C5B}" formFactor="0">
				<parameters>
					<SelectableRows type="SingleLine.Text" static="true">true</SelectableRows>
					<EnableNavigation type="SingleLine.Text" static="true">false</EnableNavigation>
				</parameters>
			</customControl>
			<customControl id="{E7A81278-8635-4d9e-8D4D-59480B391C5B}" formFactor="1">
				<parameters>
					<SelectableRows type="SingleLine.Text" static="true">true</SelectableRows>
					<EnableNavigation type="SingleLine.Text" static="true">false</EnableNavigation>
				</parameters>
			</customControl>
			<customControl id="{E7A81278-8635-4d9e-8D4D-59480B391C5B}" formFactor="2">
				<parameters>
					<SelectableRows type="SingleLine.Text" static="true">true</SelectableRows>
					<EnableNavigation type="SingleLine.Text" static="true">false</EnableNavigation>
				</parameters>
			</customControl>
		</controlDescription>
		<controlDescription forControl="{f3cf869f-5ab6-41ff-b402-a03bfe50bdbb}">
			<customControl id="{E7A81278-8635-4d9e-8D4D-59480B391C5B}" formFactor="0">
				<parameters>
					<SelectableRows type="SingleLine.Text" static="true">true</SelectableRows>
					<EnableNavigation type="SingleLine.Text" static="true">false</EnableNavigation>
				</parameters>
			</customControl>
			<customControl id="{E7A81278-8635-4d9e-8D4D-59480B391C5B}" formFactor="1">
				<parameters>
					<SelectableRows type="SingleLine.Text" static="true">true</SelectableRows>
					<EnableNavigation type="SingleLine.Text" static="true">false</EnableNavigation>
				</parameters>
			</customControl>
			<customControl id="{E7A81278-8635-4d9e-8D4D-59480B391C5B}" formFactor="2">
				<parameters>
					<SelectableRows type="SingleLine.Text" static="true">true</SelectableRows>
					<EnableNavigation type="SingleLine.Text" static="true">false</EnableNavigation>
				</parameters>
			</customControl>
		</controlDescription>
		<controlDescription forControl="{ff540e56-fd15-4b7d-9d97-79c5a30a66e9}">
			<customControl id="{E7A81278-8635-4d9e-8D4D-59480B391C5B}" formFactor="0">
				<parameters>
					<SelectableRows type="SingleLine.Text" static="true">true</SelectableRows>
					<EnableNavigation type="SingleLine.Text" static="true">true</EnableNavigation>
				</parameters>
			</customControl>
			<customControl id="{E7A81278-8635-4d9e-8D4D-59480B391C5B}" formFactor="1">
				<parameters>
					<SelectableRows type="SingleLine.Text" static="true">true</SelectableRows>
					<EnableNavigation type="SingleLine.Text" static="true">true</EnableNavigation>
				</parameters>
			</customControl>
			<customControl id="{E7A81278-8635-4d9e-8D4D-59480B391C5B}" formFactor="2">
				<parameters>
					<SelectableRows type="SingleLine.Text" static="true">true</SelectableRows>
					<EnableNavigation type="SingleLine.Text" static="true">true</EnableNavigation>
				</parameters>
			</customControl>
		</controlDescription>
		<controlDescription forControl="{4d87cfd4-64f8-41e4-b82a-512cacf08a9e}">
			<customControl id="{E7A81278-8635-4d9e-8D4D-59480B391C5B}" formFactor="0">
				<parameters>
					<SelectableRows type="SingleLine.Text" static="true">true</SelectableRows>
					<EnableNavigation type="SingleLine.Text" static="true">false</EnableNavigation>
				</parameters>
			</customControl>
			<customControl id="{E7A81278-8635-4d9e-8D4D-59480B391C5B}" formFactor="1">
				<parameters>
					<SelectableRows type="SingleLine.Text" static="true">true</SelectableRows>
					<EnableNavigation type="SingleLine.Text" static="true">false</EnableNavigation>
				</parameters>
			</customControl>
			<customControl id="{E7A81278-8635-4d9e-8D4D-59480B391C5B}" formFactor="2">
				<parameters>
					<SelectableRows type="SingleLine.Text" static="true">true</SelectableRows>
					<EnableNavigation type="SingleLine.Text" static="true">false</EnableNavigation>
				</parameters>
			</customControl>
		</controlDescription>
		<controlDescription forControl="{1713d6c1-8e3c-467d-a94d-4b97ee8cf52a}">
			<customControl id="{E7A81278-8635-4d9e-8D4D-59480B391C5B}" formFactor="0">
				<parameters>
					<SelectableRows type="SingleLine.Text" static="true">false</SelectableRows>
					<EnableNavigation type="SingleLine.Text" static="true">true</EnableNavigation>
				</parameters>
			</customControl>
			<customControl id="{E7A81278-8635-4d9e-8D4D-59480B391C5B}" formFactor="1">
				<parameters>
					<SelectableRows type="SingleLine.Text" static="true">false</SelectableRows>
					<EnableNavigation type="SingleLine.Text" static="true">true</EnableNavigation>
				</parameters>
			</customControl>
			<customControl id="{E7A81278-8635-4d9e-8D4D-59480B391C5B}" formFactor="2">
				<parameters>
					<SelectableRows type="SingleLine.Text" static="true">false</SelectableRows>
					<EnableNavigation type="SingleLine.Text" static="true">true</EnableNavigation>
				</parameters>
			</customControl>
		</controlDescription>
		<controlDescription forControl="{87f602a1-f303-4a40-8bcc-f976fdfe453c}">
			<customControl id="{270BD3DB-D9AF-4782-9025-509E298DEC0A}" formFactor="0">
				<parameters>
					<EnableNavigation type="Enum" static="true">true</EnableNavigation>
				</parameters>
			</customControl>
			<customControl id="{270BD3DB-D9AF-4782-9025-509E298DEC0A}" formFactor="1">
				<parameters>
					<EnableNavigation type="Enum" static="true">true</EnableNavigation>
				</parameters>
			</customControl>
			<customControl id="{270BD3DB-D9AF-4782-9025-509E298DEC0A}" formFactor="2">
				<parameters>
					<EnableNavigation type="Enum" static="true">true</EnableNavigation>
				</parameters>
			</customControl>
		</controlDescription>
		<controlDescription forControl="{a4f517a2-b2de-422f-8af4-1ea8cd71de61}">
			<customControl id="{4273EDBD-AC1D-40d3-9FB2-095C621B552D}" formFactor="0">
				<parameters>
					<enableCopyButton static="true" type="SingleLine.Text">true</enableCopyButton>
				</parameters>
			</customControl>
			<customControl id="{4273EDBD-AC1D-40d3-9FB2-095C621B552D}" formFactor="1">
				<parameters>
					<enableCopyButton static="true" type="SingleLine.Text">true</enableCopyButton>
				</parameters>
			</customControl>
			<customControl id="{4273EDBD-AC1D-40d3-9FB2-095C621B552D}" formFactor="2">
				<parameters>
					<enableCopyButton static="true" type="SingleLine.Text">true</enableCopyButton>
				</parameters>
			</customControl>
		</controlDescription>
		<controlDescription forControl="{998919be-6877-44be-b5fb-156e6daa5e5b}">
			<customControl id="{4273EDBD-AC1D-40d3-9FB2-095C621B552D}" formFactor="0">
				<parameters>
					<enableCopyButton static="true" type="SingleLine.Text">true</enableCopyButton>
				</parameters>
			</customControl>
			<customControl id="{4273EDBD-AC1D-40d3-9FB2-095C621B552D}" formFactor="1">
				<parameters>
					<enableCopyButton static="true" type="SingleLine.Text">true</enableCopyButton>
				</parameters>
			</customControl>
			<customControl id="{4273EDBD-AC1D-40d3-9FB2-095C621B552D}" formFactor="2">
				<parameters>
					<enableCopyButton static="true" type="SingleLine.Text">true</enableCopyButton>
				</parameters>
			</customControl>
		</controlDescription>
		<controlDescription forControl="{f9a74052-c88b-46fc-bc9a-0d28ff7e41ac}">
			<customControl id="{270BD3DB-D9AF-4782-9025-509E298DEC0A}" formFactor="0">
				<parameters>
					<EnableNavigation static="true">true</EnableNavigation>
				</parameters>
			</customControl>
			<customControl id="{270BD3DB-D9AF-4782-9025-509E298DEC0A}" formFactor="1">
				<parameters>
					<EnableNavigation static="true">true</EnableNavigation>
				</parameters>
			</customControl>
			<customControl id="{270BD3DB-D9AF-4782-9025-509E298DEC0A}" formFactor="2">
				<parameters>
					<EnableNavigation static="true">true</EnableNavigation>
				</parameters>
			</customControl>
		</controlDescription>
		<controlDescription forControl="{37d0cecc-0277-464f-9aa5-75d398d12dd6}">
			<customControl id="{E7A81278-8635-4d9e-8D4D-59480B391C5B}" formFactor="0">
				<parameters>
					<SelectableRows type="SingleLine.Text" static="true">true</SelectableRows>
					<EnableNavigation type="SingleLine.Text" static="true">true</EnableNavigation>
				</parameters>
			</customControl>
			<customControl id="{E7A81278-8635-4d9e-8D4D-59480B391C5B}" formFactor="1">
				<parameters>
					<SelectableRows type="SingleLine.Text" static="true">true</SelectableRows>
					<EnableNavigation type="SingleLine.Text" static="true">true</EnableNavigation>
				</parameters>
			</customControl>
			<customControl id="{E7A81278-8635-4d9e-8D4D-59480B391C5B}" formFactor="2">
				<parameters>
					<SelectableRows type="SingleLine.Text" static="true">true</SelectableRows>
					<EnableNavigation type="SingleLine.Text" static="true">true</EnableNavigation>
				</parameters>
			</customControl>
		</controlDescription>
		<controlDescription forControl="{615d202f-ce24-40f8-98ec-be7aff2856d4}">
			<customControl id="{E7A81278-8635-4d9e-8D4D-59480B391C5B}" formFactor="0">
				<parameters>
					<SelectableRows type="SingleLine.Text" static="true">false</SelectableRows>
					<EnableNavigation type="SingleLine.Text" static="true">true</EnableNavigation>
				</parameters>
			</customControl>
			<customControl id="{E7A81278-8635-4d9e-8D4D-59480B391C5B}" formFactor="1">
				<parameters>
					<SelectableRows type="SingleLine.Text" static="true">false</SelectableRows>
					<EnableNavigation type="SingleLine.Text" static="true">true</EnableNavigation>
				</parameters>
			</customControl>
			<customControl id="{E7A81278-8635-4d9e-8D4D-59480B391C5B}" formFactor="2">
				<parameters>
					<SelectableRows type="SingleLine.Text" static="true">false</SelectableRows>
					<EnableNavigation type="SingleLine.Text" static="true">true</EnableNavigation>
				</parameters>
			</customControl>
		</controlDescription>
		<controlDescription forControl="{8d014bcf-538a-4be3-9ce7-bb9ab51709fc}">
			<customControl id="{E7A81278-8635-4d9e-8D4D-59480B391C5B}" formFactor="0">
				<parameters>
					<SelectableRows type="SingleLine.Text" static="true">false</SelectableRows>
					<EnableNavigation type="SingleLine.Text" static="true">true</EnableNavigation>
				</parameters>
			</customControl>
			<customControl id="{E7A81278-8635-4d9e-8D4D-59480B391C5B}" formFactor="1">
				<parameters>
					<SelectableRows type="SingleLine.Text" static="true">false</SelectableRows>
					<EnableNavigation type="SingleLine.Text" static="true">true</EnableNavigation>
				</parameters>
			</customControl>
			<customControl id="{E7A81278-8635-4d9e-8D4D-59480B391C5B}" formFactor="2">
				<parameters>
					<SelectableRows type="SingleLine.Text" static="true">false</SelectableRows>
					<EnableNavigation type="SingleLine.Text" static="true">true</EnableNavigation>
				</parameters>
			</customControl>
		</controlDescription>
		<controlDescription forControl="{913c2332-4da7-44fc-a2d9-1455e77ad947}">
			<customControl id="{E7A81278-8635-4d9e-8D4D-59480B391C5B}" formFactor="0">
				<parameters>
					<SelectableRows type="SingleLine.Text" static="true">false</SelectableRows>
					<EnableNavigation type="SingleLine.Text" static="true">false</EnableNavigation>
				</parameters>
			</customControl>
			<customControl id="{E7A81278-8635-4d9e-8D4D-59480B391C5B}" formFactor="1">
				<parameters>
					<SelectableRows type="SingleLine.Text" static="true">false</SelectableRows>
					<EnableNavigation type="SingleLine.Text" static="true">false</EnableNavigation>
				</parameters>
			</customControl>
			<customControl id="{E7A81278-8635-4d9e-8D4D-59480B391C5B}" formFactor="2">
				<parameters>
					<SelectableRows type="SingleLine.Text" static="true">false</SelectableRows>
					<EnableNavigation type="SingleLine.Text" static="true">false</EnableNavigation>
				</parameters>
			</customControl>
		</controlDescription>
		<controlDescription forControl="{50ba401e-ddb3-406e-96d0-923b03c2ab54}">
			<customControl id="{E7A81278-8635-4d9e-8D4D-59480B391C5B}" formFactor="0">
				<parameters>
					<SelectableRows type="SingleLine.Text" static="true">multiple</SelectableRows>
					<EnableNavigation type="SingleLine.Text" static="true">false</EnableNavigation>
				</parameters>
			</customControl>
			<customControl id="{E7A81278-8635-4d9e-8D4D-59480B391C5B}" formFactor="1">
				<parameters>
					<SelectableRows type="SingleLine.Text" static="true">multiple</SelectableRows>
					<EnableNavigation type="SingleLine.Text" static="true">false</EnableNavigation>
				</parameters>
			</customControl>
			<customControl id="{E7A81278-8635-4d9e-8D4D-59480B391C5B}" formFactor="2">
				<parameters>
					<SelectableRows type="SingleLine.Text" static="true">multiple</SelectableRows>
					<EnableNavigation type="SingleLine.Text" static="true">false</EnableNavigation>
				</parameters>
			</customControl>
		</controlDescription>
		<controlDescription forControl="{302744d3-9248-49df-8552-8e2ee047ca01}">
			<customControl id="{270BD3DB-D9AF-4782-9025-509E298DEC0A}" formFactor="0">
				<parameters>
					<EnableNavigation type="Enum" static="true">true</EnableNavigation>
				</parameters>
			</customControl>
			<customControl id="{270BD3DB-D9AF-4782-9025-509E298DEC0A}" formFactor="1">
				<parameters>
					<EnableNavigation type="Enum" static="true">true</EnableNavigation>
				</parameters>
			</customControl>
			<customControl id="{270BD3DB-D9AF-4782-9025-509E298DEC0A}" formFactor="2">
				<parameters>
					<EnableNavigation type="Enum" static="true">true</EnableNavigation>
				</parameters>
			</customControl>
		</controlDescription>
		<controlDescription forControl="{46754cad-8666-4a01-800e-7ac89c5887e2}">
			<customControl id="{E7A81278-8635-4D9E-8D4D-59480B391C5B}">
				<parameters></parameters>
			</customControl>
			<customControl formFactor="0" name="talxis_TALXIS.PCF.Grid">
				<parameters>
					<Columns type="Multiple" static="true">[ { "name": "ntg_contractidslist__virtual", "dataType": "SingleLine.Text", "displayName": "Smlouvy", "isVirtual": true }]</Columns>
					<RowHeight type="Whole.None" static="true">42</RowHeight>
					<EnableFiltering type="Enum" static="true">true</EnableFiltering>
					<EnableSorting type="Enum" static="true">true</EnableSorting>
					<EnableNavigation type="Enum" static="true">true</EnableNavigation>
					<SelectableRows type="Enum" static="true">none</SelectableRows>
					<EnablePageSizeSwitcher type="Enum" static="true">true</EnablePageSizeSwitcher>
					<EnableZebra type="Enum" static="true">true</EnableZebra>
					<DefaultExpandedGroupLevel type="Whole.None" static="true">-1</DefaultExpandedGroupLevel>
					<ClientApiWebresourceName type="SingleLine.Text" static="true">talxis_appshomepresentation.js</ClientApiWebresourceName>
					<ClientApiFunctionName type="SingleLine.Text" static="true">TALXIS.Apps.Environment.Bootstrap.Apps.Home.Presentation.virtualDataset.onDatasetControlInitialized</ClientApiFunctionName>
				</parameters>
			</customControl>
			<customControl formFactor="2" name="talxis_TALXIS.PCF.Grid">
				<parameters>
					<Columns type="Multiple" static="true">[ { "name": "ntg_contractidslist__virtual", "dataType": "SingleLine.Text", "displayName": "Smlouvy", "isVirtual": true }]</Columns>
					<RowHeight type="Whole.None" static="true">42</RowHeight>
					<EnableFiltering type="Enum" static="true">true</EnableFiltering>
					<EnableSorting type="Enum" static="true">true</EnableSorting>
					<EnableNavigation type="Enum" static="true">true</EnableNavigation>
					<SelectableRows type="Enum" static="true">none</SelectableRows>
					<EnablePageSizeSwitcher type="Enum" static="true">true</EnablePageSizeSwitcher>
					<EnableZebra type="Enum" static="true">true</EnableZebra>
					<DefaultExpandedGroupLevel type="Whole.None" static="true">-1</DefaultExpandedGroupLevel>
					<ClientApiWebresourceName type="SingleLine.Text" static="true">talxis_appshomepresentation.js</ClientApiWebresourceName>
					<ClientApiFunctionName type="SingleLine.Text" static="true">TALXIS.Apps.Environment.Bootstrap.Apps.Home.Presentation.virtualDataset.onDatasetControlInitialized</ClientApiFunctionName>
				</parameters>
			</customControl>
			<customControl formFactor="1" name="talxis_TALXIS.PCF.Grid">
				<parameters>
					<Columns type="Multiple" static="true">[ { "name": "ntg_contractidslist__virtual", "dataType": "SingleLine.Text", "displayName": "Smlouvy", "isVirtual": true }]</Columns>
					<RowHeight type="Whole.None" static="true">42</RowHeight>
					<EnableFiltering type="Enum" static="true">true</EnableFiltering>
					<EnableSorting type="Enum" static="true">true</EnableSorting>
					<EnableNavigation type="Enum" static="true">true</EnableNavigation>
					<SelectableRows type="Enum" static="true">none</SelectableRows>
					<EnablePageSizeSwitcher type="Enum" static="true">true</EnablePageSizeSwitcher>
					<EnableZebra type="Enum" static="true">true</EnableZebra>
					<DefaultExpandedGroupLevel type="Whole.None" static="true">-1</DefaultExpandedGroupLevel>
					<ClientApiWebresourceName type="SingleLine.Text" static="true">talxis_appshomepresentation.js</ClientApiWebresourceName>
					<ClientApiFunctionName type="SingleLine.Text" static="true">TALXIS.Apps.Environment.Bootstrap.Apps.Home.Presentation.virtualDataset.onDatasetControlInitialized</ClientApiFunctionName>
				</parameters>
			</customControl>
		</controlDescription>
		<controlDescription forControl="{e9c08c1b-bbe0-4281-86eb-eef3a8c7533e}">
			<customControl id="{E7A81278-8635-4D9E-8D4D-59480B391C5B}">
				<parameters></parameters>
			</customControl>
			<customControl formFactor="0" name="talxis_TALXIS.PCF.Grid">
				<parameters>
					<Columns type="Multiple" static="true">[ { "name": "ntg_contractidslist__virtual", "dataType": "SingleLine.Text", "displayName": "Smlouvy", "isVirtual": true }]</Columns>
					<RowHeight type="Whole.None" static="true">42</RowHeight>
					<EnableFiltering type="Enum" static="true">true</EnableFiltering>
					<EnableSorting type="Enum" static="true">true</EnableSorting>
					<EnableNavigation type="Enum" static="true">true</EnableNavigation>
					<SelectableRows type="Enum" static="true">none</SelectableRows>
					<EnablePageSizeSwitcher type="Enum" static="true">true</EnablePageSizeSwitcher>
					<EnableZebra type="Enum" static="true">true</EnableZebra>
					<DefaultExpandedGroupLevel type="Whole.None" static="true">-1</DefaultExpandedGroupLevel>
					<ClientApiWebresourceName type="SingleLine.Text" static="true">talxis_appshomepresentation.js</ClientApiWebresourceName>
					<ClientApiFunctionName type="SingleLine.Text" static="true">TALXIS.Apps.Environment.Bootstrap.Apps.Home.Presentation.virtualDataset.onDatasetControlInitialized</ClientApiFunctionName>
				</parameters>
			</customControl>
			<customControl formFactor="2" name="talxis_TALXIS.PCF.Grid">
				<parameters>
					<Columns type="Multiple" static="true">[ { "name": "ntg_contractidslist__virtual", "dataType": "SingleLine.Text", "displayName": "Smlouvy", "isVirtual": true }]</Columns>
					<RowHeight type="Whole.None" static="true">42</RowHeight>
					<EnableFiltering type="Enum" static="true">true</EnableFiltering>
					<EnableSorting type="Enum" static="true">true</EnableSorting>
					<EnableNavigation type="Enum" static="true">true</EnableNavigation>
					<SelectableRows type="Enum" static="true">none</SelectableRows>
					<EnablePageSizeSwitcher type="Enum" static="true">true</EnablePageSizeSwitcher>
					<EnableZebra type="Enum" static="true">true</EnableZebra>
					<DefaultExpandedGroupLevel type="Whole.None" static="true">-1</DefaultExpandedGroupLevel>
					<ClientApiWebresourceName type="SingleLine.Text" static="true">talxis_appshomepresentation.js</ClientApiWebresourceName>
					<ClientApiFunctionName type="SingleLine.Text" static="true">TALXIS.Apps.Environment.Bootstrap.Apps.Home.Presentation.virtualDataset.onDatasetControlInitialized</ClientApiFunctionName>
				</parameters>
			</customControl>
			<customControl formFactor="1" name="talxis_TALXIS.PCF.Grid">
				<parameters>
					<Columns type="Multiple" static="true">[ { "name": "ntg_contractidslist__virtual", "dataType": "SingleLine.Text", "displayName": "Smlouvy", "isVirtual": true }]</Columns>
					<RowHeight type="Whole.None" static="true">42</RowHeight>
					<EnableFiltering type="Enum" static="true">true</EnableFiltering>
					<EnableSorting type="Enum" static="true">true</EnableSorting>
					<EnableNavigation type="Enum" static="true">true</EnableNavigation>
					<SelectableRows type="Enum" static="true">none</SelectableRows>
					<EnablePageSizeSwitcher type="Enum" static="true">true</EnablePageSizeSwitcher>
					<EnableZebra type="Enum" static="true">true</EnableZebra>
					<DefaultExpandedGroupLevel type="Whole.None" static="true">-1</DefaultExpandedGroupLevel>
					<ClientApiWebresourceName type="SingleLine.Text" static="true">talxis_appshomepresentation.js</ClientApiWebresourceName>
					<ClientApiFunctionName type="SingleLine.Text" static="true">TALXIS.Apps.Environment.Bootstrap.Apps.Home.Presentation.virtualDataset.onDatasetControlInitialized</ClientApiFunctionName>
				</parameters>
			</customControl>
		</controlDescription>
	</controlDescriptions>
	<DisplayConditions Order="1">
		<Everyone />
	</DisplayConditions>
	<formLibraries>
		<Library name="talxis_asyncjobs.js" libraryUniqueId="{c95f38ed-ba1d-488a-9f4b-4ca84411d380}" />
		<Library name="talxis_startappsdefault.js" libraryUniqueId="{b26dfdf1-a90b-41a5-bdc0-d00a732ad196}" />
		<Library name="ntg_coreappshome.js" libraryUniqueId="{41e41305-517b-4052-afb7-18eda957e75c}" />
		<Library name="talxis_appshomepresentation.js" libraryUniqueId="{6b248e65-741e-4eeb-b9c5-bdcc25bc25ff}" />
	</formLibraries>
	<events>
		<event name="onload" application="false" active="true">
			<Handlers>
				<Handler functionName="PCT21016.Core.Apps.Home.account.Main.OnMainAccountFormLoad" libraryName="ntg_coreappshome.js" handlerUniqueId="{530296c2-dbe1-4990-b407-8d883ce4bf06}" enabled="true" parameters="" passExecutionContext="true" />
				<Handler functionName="Talxis.Utility.Features.AsyncJobs.AsyncHandler.Main" libraryName="talxis_asyncjobs.js" handlerUniqueId="{16410b17-ef33-4776-8381-a9e049b225b2}" enabled="true" parameters="" passExecutionContext="true" />
				<Handler functionName="PCT21016.Core.Apps.Home.ntg_wastecollectionorderheader.Order.AddFilterToSitesAndContacts" libraryName="ntg_coreappshome.js" handlerUniqueId="{16b03727-0742-425b-93a4-8e61a83db92e}" enabled="true" parameters="" passExecutionContext="true" />
				<Handler functionName="TALXIS.Apps.Environment.Start.account.Main.MainFormOnLoad" libraryName="talxis_startappsdefault.js" handlerUniqueId="{ce0ecefd-fa4e-46a8-8a46-99302f5a458f}" enabled="true" parameters="" passExecutionContext="true" />
				<Handler functionName="PCT21016.Core.Apps.Home.Presentation.talxis_account_Main.SetupAmenityDatasetControl" libraryName="ntg_coreappshomepresentation.js" handlerUniqueId="{60c07c06-763a-4c3d-a9a4-8c43f8a17964}" enabled="true" parameters="" passExecutionContext="true" />
				<Handler functionName="PCT21016.Core.Apps.Home.Presentation.talxis_account_Main.SetupRecyclingAmenityDatasetControl" libraryName="ntg_coreappshomepresentation.js" handlerUniqueId="{fe9e49a7-14bd-4a6d-bb37-5459ffbeca63}" enabled="true" parameters="" passExecutionContext="true" />
			</Handlers>
		</event>
		<event name="onchange" attribute="ntg_relationshippcf" application="false" active="true">
			<Handlers>
				<Handler functionName="PCT21016.Core.Apps.Home.account.Main.setRelationshipBasedVisibility" libraryName="ntg_coreappshome.js" handlerUniqueId="{e9d6f08c-f33b-4d27-8968-0fefe30af4b9}" enabled="true" parameters="" passExecutionContext="true" />
			</Handlers>
		</event>
		<event name="onchange" attribute="primarycontactid" application="false" active="true">
			<Handlers>
				<Handler functionName="PCT21016.Core.Apps.Home.account.Main.DisplayContactPersonType" libraryName="ntg_coreappshome.js" handlerUniqueId="{049619b5-cb31-48e5-9ef6-bd897f1f7238}" enabled="true" parameters="" passExecutionContext="true" />
			</Handlers>
		</event>
		<event name="tabstatechange" application="false" active="false">
			<Handlers>
				<Handler functionName="PCT21016.Core.Apps.Home.Presentation.talxis_account_Main.SetupAmenityDatasetControl" libraryName="ntg_coreappshomepresentation.js" handlerUniqueId="{19ec2959-ce14-4fed-a3bf-b349a9e8a2aa}" enabled="true" parameters="" passExecutionContext="true" />
				<Handler functionName="PCT21016.Core.Apps.Home.Presentation.talxis_account_Main.SetupRecyclingAmenityDatasetControl" libraryName="ntg_coreappshomepresentation.js" handlerUniqueId="{b2959120-850d-4362-9d20-bde17cce2303}" enabled="true" parameters="" passExecutionContext="true" />
			</Handlers>
		</event>
	</events>
</form>`