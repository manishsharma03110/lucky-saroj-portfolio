"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { Input, Label, Textarea } from "@/components/ui/Input";
import { FormCard } from "@/components/admin/FormParts";
import { MediaForm } from "@/components/admin/MediaForm";
import { FileUpload } from "@/components/admin/FileUpload";
import { ContactOptionsEditor } from "@/components/admin/ContactOptionsEditor";
import { NavigationLinksEditor } from "@/components/admin/NavigationLinksEditor";
import { updatePageContentAction } from "@/lib/actions/page-content";
import { PAGE_CONTENT_CONFIG, type PageContentKey } from "@/lib/page-content";
import { pageContentFields } from "@/lib/page-content-extra";
import type { ActionState } from "@/lib/actions/portfolio";
import styles from "./AdminEditorial.module.css";

const initialState:ActionState={status:"idle"};
export function PageContentForm({pageKey,content,revision,heroImageAssetId,includeKeys,title}:{pageKey:PageContentKey;content:Record<string,string>;revision:number;heroImageAssetId?:string|null;includeKeys?:readonly string[];title?:string}){
  const [state,action,pending]=useActionState(updatePageContentAction,initialState);const config=PAGE_CONTENT_CONFIG[pageKey];const allFields=pageContentFields(pageKey,config.fields);const visible=includeKeys?allFields.filter(f=>includeKeys.includes(f.key)):allFields;const hidden=includeKeys?allFields.filter(f=>!includeKeys.includes(f.key)):[];
  return <MediaForm action={action} className={styles.sectionStack}><input type="hidden" name="pageKey" value={pageKey}/><input type="hidden" name="revision" value={state.revision??revision}/>{hidden.map(field=><input key={field.key} type="hidden" name={field.key} value={content[field.key]??field.defaultValue}/>)}
    <FormCard title={title??config.label}><div className="grid grid-cols-1 gap-5 lg:grid-cols-2">{visible.map(field=>{if(field.key==="navItemsJson")return <NavigationLinksEditor key={field.key} name={field.key} defaultValue={content[field.key]??field.defaultValue}/>;if(field.kind==="contact-options")return <div key={field.key} className="lg:col-span-2"><ContactOptionsEditor name={field.key} defaultValue={content[field.key]??field.defaultValue}/></div>;if(field.kind==="image")return <div key={field.key} className="lg:col-span-2"><FileUpload name={field.key} assetIdName="heroImageAssetId" label={field.label} kind="image" defaultValue={content[field.key]??field.defaultValue} defaultAssetId={heroImageAssetId}/></div>;return <div key={field.key} className={field.kind==="textarea"?"lg:col-span-2":undefined}><Label htmlFor={`${pageKey}-${field.key}`}>{field.label}</Label>{field.kind==="textarea"?<Textarea id={`${pageKey}-${field.key}`} name={field.key} rows={3} maxLength={field.maxLength??1000} defaultValue={content[field.key]??field.defaultValue}/>:<Input id={`${pageKey}-${field.key}`} name={field.key} type="text" maxLength={field.maxLength??300} defaultValue={content[field.key]??field.defaultValue}/>}</div>;})}</div></FormCard>
    {state.status==="error"&&state.message&&<p className={styles.feedbackError}>{state.message}</p>}{state.status==="success"&&state.message&&<p className={styles.feedbackSuccess}>{state.message}</p>}<div className={styles.saveBar}><Button type="submit" disabled={pending}>{pending?"Saving...":`Save ${title??config.label}`}</Button></div>
  </MediaForm>;
}
