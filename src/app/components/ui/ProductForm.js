"use client";

import { useState, useEffect } from "react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

import StringListEditor from "./product-form/StringListEditor";
import VariantsEditor from "./product-form/VariantsEditor";
import FaqsEditor from "./product-form/FaqsEditor";

// NOTE: ServingsEditor and FlavoursEditor are no longer imported/used.
// The API now folds size, flavour, price, discountedPrice, and
// stockQuantity into a single `variants[]` array per product — there's
// no more separate top-level price/discounted/stockQuantity, and no
// separate servings[]/flavours[] arrays. You can delete those two files.

const emptyForm = {
  slug: "",
  name: "",
  sku: "",
  status: "active",
  categoryId: "",
  title: "",
  description: "",
  flipkartLink: "",
  amazonLink: "",
  cost2cost: "",
  featuredimg: "",
  images: [],
  variants: [],
  keyBenefits: [],
  whychooseus: [],
  whoShouldUse: [],
  howToUse: [],
  whatToAvoid: [],
  safetyInformation: [],
  faqs: [],
  seo: {
    title: "",
    description: "",
    keywords: "",
    canonical: "",
    author: "",
    publisher: "",
    language: "English",
    robots: "index, follow",
    geo: {
      region: "",
      placename: "",
    },
    og: {
      title: "",
      type: "website",
      image: "",
      image_alt: "",
      locale: "",
      site_name: "",
      description: "",
      url: "",
    },
    twitter: {
      card: "summary_large_image",
      title: "",
      site: "",
      description: "",
      image: "",
      image_alt: "",
    },
  },
};

// Required Fields
function validateForm(form) {
  const errors = [];

  if (!form.name.trim()) errors.push("Name is required");
  if (!form.slug.trim()) errors.push("Slug is required");
  if (!form.sku.trim()) errors.push("SKU is required");
  if (!form.categoryId) errors.push("Category ID is required");
  if (!form.status.trim()) errors.push("Status is required");
  if (!form.title.trim()) errors.push("Title is required");
  if (!form.description.trim())
    errors.push("Description is required");

  if (!form.featuredimg.trim())
    errors.push("Featured image is required");

  if (form.images.length === 0)
    errors.push("At least one gallery image is required");

  if (form.variants.length === 0) {
    errors.push("At least one variant is required");
  } else {
    form.variants.forEach((v, i) => {
      const label = `Variant ${i + 1}`;

      if (!String(v.flavour ?? "").trim())
        errors.push(`${label}: flavour is required`);

      if (!String(v.size ?? "").trim())
        errors.push(`${label}: size is required`);

      if (v.price === "" || v.price == null)
        errors.push(`${label}: price is required`);

      // if (v.discountedPrice === "" || v.discountedPrice == null)
      //   errors.push(`${label}: discounted price is required`);

      if (
        v.stockQuantity === "" ||
        v.stockQuantity == null
      ) {
        errors.push(
          `${label}: stock quantity is required`
        );
      }
    });
  }

  if (form.keyBenefits.length === 0)
    errors.push(
      "At least one key benefit is required"
    );

  if (form.faqs.length === 0)
    errors.push("At least one FAQ is required");

  if (!form.seo.title.trim())
    errors.push("SEO title is required");

  if (!form.seo.description.trim())
    errors.push("SEO description is required");

  if (!form.seo.canonical.trim())
    errors.push("SEO canonical URL is required");

  return errors;
}

export default function ProductForm({
  open,
  onOpenChange,
  product,
  onSave,
}) {
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState([]);

  useEffect(() => {
    if (product) {
      setForm({
        ...emptyForm,
        ...product,

        category: product.category || "",

        images: product.images || [],

        featuredimg: product.featuredimg || "",

        variants: product.variants || [],

        seo: {
          ...emptyForm.seo,
          ...(product.seo || {}),

          geo: {
            ...emptyForm.seo.geo,
            ...(product.seo?.geo || {}),
          },

          og: {
            ...emptyForm.seo.og,
            ...(product.seo?.og || {}),
          },

          twitter: {
            ...emptyForm.seo.twitter,
            ...(product.seo?.twitter || {}),
          },
        },
      });
    } else {
      setForm(emptyForm);
    }
  }, [product, open]);

  function set(field, value) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  function setSeo(field, value) {
    setForm((prev) => ({
      ...prev,
      seo: {
        ...prev.seo,
        [field]: value,
      },
    }));
  }

  function setSeoNested(section, field, value) {
    setForm((prev) => ({
      ...prev,
      seo: {
        ...prev.seo,
        [section]: {
          ...prev.seo[section],
          [field]: value,
        },
      },
    }));
  }

  function handleSubmit(e) {
    e.preventDefault();

    const validationErrors = validateForm(form);

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors([]);

    const payload = {
      ...form,

      categoryId: Number(form.categoryId),

      // price/discountedPrice stay strings (matches the API's own shape),
      // stockQuantity is a real number — same split the old top-level
      // fields used, just applied per variant now.
      variants: form.variants.map((v) => ({
        ...v,

        price:
          v.price === "" || v.price == null
            ? v.price
            : String(v.price),

        discountedPrice:
          v.discountedPrice === "" ||
          v.discountedPrice == null
            ? v.discountedPrice
            : String(v.discountedPrice),

        stockQuantity:
          v.stockQuantity === "" ||
          v.stockQuantity == null
            ? 0
            : Number(v.stockQuantity),
      })),
    };

    onSave(
      product
        ? {
            ...product,
            ...payload,
          }
        : payload
    );

    onOpenChange(false);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent
        className="
          max-w-[calc(100%-1rem)]
          max-h-[85vh]
          overflow-y-auto
          p-4

          sm:max-w-3xl
          sm:p-6
        "
      >
        <DialogHeader>
          <DialogTitle>
            {product
              ? "Edit Product"
              : "Add Product"}
          </DialogTitle>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          <Tabs defaultValue="basic">
            {/* =====================================================
                RESPONSIVE TABS
                Desktop/laptop: same wrapping behavior as original.
                Mobile: horizontal scrolling.
            ====================================================== */}

            <div
              className="
                max-w-full
                overflow-x-auto
                sm:overflow-visible
              "
            >
              <TabsList
                className="
                  flex
                  h-auto
                  flex-wrap

                  max-sm:w-max
                  max-sm:flex-nowrap
                "
              >
                <TabsTrigger value="basic">
                  Basic Info
                </TabsTrigger>

                <TabsTrigger value="images">
                  Images
                </TabsTrigger>

                <TabsTrigger value="pricing">
                  Pricing & Variants
                </TabsTrigger>

                <TabsTrigger value="content">
                  Content
                </TabsTrigger>

                <TabsTrigger value="faqs">
                  FAQs
                </TabsTrigger>

                <TabsTrigger value="seo">
                  SEO
                </TabsTrigger>
              </TabsList>
            </div>

            {/* =====================================================
                BASIC INFO
            ====================================================== */}

            <TabsContent
              value="basic"
              className="space-y-3 pt-4"
            >
              {/* Mobile: 1 column
                  Desktop/Laptop: 2 columns */}

              <div
                className="
                  grid
                  grid-cols-1
                  gap-3
                  sm:grid-cols-2
                "
              >
                <div className="min-w-0 space-y-1.5">
                  <Label>Name</Label>

                  <Input
                    className="min-w-0"
                    value={form.name}
                    onChange={(e) =>
                      set(
                        "name",
                        e.target.value
                      )
                    }
                    required
                  />
                </div>

                <div className="min-w-0 space-y-1.5">
                  <Label>Slug</Label>

                  <Input
                    className="min-w-0"
                    value={form.slug}
                    onChange={(e) =>
                      set(
                        "slug",
                        e.target.value
                      )
                    }
                    required
                  />
                </div>

                <div className="min-w-0 space-y-1.5">
                  <Label>SKU</Label>

                  <Input
                    className="min-w-0"
                    value={form.sku ?? ""}
                    onChange={(e) =>
                      set(
                        "sku",
                        e.target.value
                      )
                    }
                    required
                  />
                </div>

                <div className="min-w-0 space-y-1.5">
                  <Label>Category ID</Label>

                  <Input
                    className="min-w-0"
                    type="number"
                    value={form.categoryId}
                    onChange={(e) =>
                      set(
                        "categoryId",
                        e.target.value
                      )
                    }
                    required
                  />
                </div>

                <div className="min-w-0 space-y-1.5">
                  <Label>Status</Label>

                  <select
                    value={form.status}
                    onChange={(e) =>
                      set(
                        "status",
                        e.target.value
                      )
                    }
                    className="
                      h-9
                      w-full
                      rounded-md
                      border
                      bg-transparent
                      px-3
                      text-sm
                    "
                  >
                    <option value="active">
                      Active
                    </option>

                    <option value="inactive">
                      Inactive
                    </option>
                  </select>
                </div>
              </div>

              {/* TITLE */}

              <div className="min-w-0 space-y-1.5">
                <Label>Title</Label>

                <Input
                  className="min-w-0"
                  value={form.title}
                  onChange={(e) =>
                    set(
                      "title",
                      e.target.value
                    )
                  }
                  required
                />
              </div>

              {/* DESCRIPTION */}

              <div className="min-w-0 space-y-1.5">
                <Label>Description</Label>

                <Textarea
                  className="min-w-0"
                  value={form.description}
                  onChange={(e) =>
                    set(
                      "description",
                      e.target.value
                    )
                  }
                  required
                />
              </div>

              {/* MARKETPLACE LINKS
                  Mobile: 1 column
                  Desktop/Laptop: 3 columns */}

              <div
                className="
                  grid
                  grid-cols-1
                  gap-3
                  sm:grid-cols-3
                "
              >
                <div className="min-w-0 space-y-1.5">
                  <Label>
                    Flipkart Link
                  </Label>

                  <Input
                    className="min-w-0"
                    value={
                      form.flipkartLink ?? ""
                    }
                    onChange={(e) =>
                      set(
                        "flipkartLink",
                        e.target.value
                      )
                    }
                  />
                </div>

                <div className="min-w-0 space-y-1.5">
                  <Label>
                    Amazon Link
                  </Label>

                  <Input
                    className="min-w-0"
                    value={
                      form.amazonLink ?? ""
                    }
                    onChange={(e) =>
                      set(
                        "amazonLink",
                        e.target.value
                      )
                    }
                  />
                </div>

                <div className="min-w-0 space-y-1.5">
                  <Label>
                    Cost2Cost Link
                  </Label>

                  <Input
                    className="min-w-0"
                    value={
                      form.cost2cost
                    }
                    onChange={(e) =>
                      set(
                        "cost2cost",
                        e.target.value
                      )
                    }
                  />
                </div>
              </div>
            </TabsContent>

            {/* =====================================================
                IMAGES
            ====================================================== */}

            <TabsContent
              value="images"
              className="space-y-4 pt-4"
            >
              <div className="min-w-0 space-y-1.5">
                <Label>
                  Featured Image Path
                </Label>

                <Input
                  className="min-w-0"
                  value={form.featuredimg}
                  onChange={(e) =>
                    set(
                      "featuredimg",
                      e.target.value
                    )
                  }
                  placeholder="/Promolecules/product-name/image.webp"
                />
              </div>

              <StringListEditor
                label="Gallery Images"
                items={form.images}
                onChange={(v) =>
                  set("images", v)
                }
                placeholder="/Promolecules/product-name/image.webp"
              />
            </TabsContent>

            {/* =====================================================
                PRICING & VARIANTS
            ====================================================== */}

            <TabsContent
              value="pricing"
              className="space-y-4 pt-4"
            >
              <p className="text-sm text-slate-500">
                Price, discounted price, and
                stock are now set per variant below —
                there&apos;s no separate base price
                for the product itself.
              </p>

              <div className="w-full overflow-x-auto">
                <VariantsEditor
                  variants={form.variants}
                  onChange={(v) =>
                    set(
                      "variants",
                      v
                    )
                  }
                />
              </div>
            </TabsContent>

            {/* =====================================================
                CONTENT LISTS
            ====================================================== */}

            <TabsContent
              value="content"
              className="space-y-5 pt-4"
            >
              <StringListEditor
                label="Key Benefits"
                items={form.keyBenefits}
                onChange={(v) =>
                  set(
                    "keyBenefits",
                    v
                  )
                }
              />

              <StringListEditor
                label="Why Choose Us"
                items={form.whychooseus}
                onChange={(v) =>
                  set(
                    "whychooseus",
                    v
                  )
                }
              />

              <StringListEditor
                label="Who Should Use"
                items={form.whoShouldUse}
                onChange={(v) =>
                  set(
                    "whoShouldUse",
                    v
                  )
                }
              />

              <StringListEditor
                label="How To Use"
                items={form.howToUse}
                onChange={(v) =>
                  set(
                    "howToUse",
                    v
                  )
                }
              />

              <StringListEditor
                label="What To Avoid"
                items={form.whatToAvoid}
                onChange={(v) =>
                  set(
                    "whatToAvoid",
                    v
                  )
                }
              />

              <StringListEditor
                label="Safety Information"
                items={
                  form.safetyInformation
                }
                onChange={(v) =>
                  set(
                    "safetyInformation",
                    v
                  )
                }
              />
            </TabsContent>

            {/* =====================================================
                FAQS
            ====================================================== */}

            <TabsContent
              value="faqs"
              className="pt-4"
            >
              <FaqsEditor
                faqs={form.faqs}
                onChange={(v) =>
                  set("faqs", v)
                }
              />
            </TabsContent>

            {/* =====================================================
                SEO
            ====================================================== */}

            <TabsContent
              value="seo"
              className="space-y-3 pt-4"
            >
              <div className="min-w-0 space-y-1.5">
                <Label>SEO Title</Label>

                <Input
                  className="min-w-0"
                  value={form.seo.title}
                  onChange={(e) =>
                    setSeo(
                      "title",
                      e.target.value
                    )
                  }
                  required
                />
              </div>

              <div className="min-w-0 space-y-1.5">
                <Label>
                  SEO Description
                </Label>

                <Textarea
                  className="min-w-0"
                  value={
                    form.seo.description
                  }
                  onChange={(e) =>
                    setSeo(
                      "description",
                      e.target.value
                    )
                  }
                  required
                />
              </div>

              {/* Mobile: 1 column
                  Desktop/Laptop: 2 columns */}

              <div
                className="
                  grid
                  grid-cols-1
                  gap-3
                  sm:grid-cols-2
                "
              >
                <div className="min-w-0 space-y-1.5">
                  <Label>Keywords</Label>

                  <Input
                    className="min-w-0"
                    value={
                      form.seo.keywords
                    }
                    onChange={(e) =>
                      setSeo(
                        "keywords",
                        e.target.value
                      )
                    }
                    required
                  />
                </div>

                <div className="min-w-0 space-y-1.5">
                  <Label>
                    Canonical URL
                  </Label>

                  <Input
                    className="min-w-0"
                    value={
                      form.seo.canonical
                    }
                    onChange={(e) =>
                      setSeo(
                        "canonical",
                        e.target.value
                      )
                    }
                    required
                  />
                </div>

                <div className="min-w-0 space-y-1.5">
                  <Label>Author</Label>

                  <Input
                    className="min-w-0"
                    value={
                      form.seo.author
                    }
                    onChange={(e) =>
                      setSeo(
                        "author",
                        e.target.value
                      )
                    }
                  />
                </div>

                <div className="min-w-0 space-y-1.5">
                  <Label>Publisher</Label>

                  <Input
                    className="min-w-0"
                    value={
                      form.seo.publisher
                    }
                    onChange={(e) =>
                      setSeo(
                        "publisher",
                        e.target.value
                      )
                    }
                  />
                </div>

                <div className="min-w-0 space-y-1.5">
                  <Label>Language</Label>

                  <Input
                    className="min-w-0"
                    value={
                      form.seo.language
                    }
                    onChange={(e) =>
                      setSeo(
                        "language",
                        e.target.value
                      )
                    }
                  />
                </div>

                <div className="min-w-0 space-y-1.5">
                  <Label>Robots</Label>

                  <Input
                    className="min-w-0"
                    value={
                      form.seo.robots
                    }
                    onChange={(e) =>
                      setSeo(
                        "robots",
                        e.target.value
                      )
                    }
                  />
                </div>
              </div>

              {/* OPEN GRAPH */}

              <div className="border rounded-md p-3 space-y-2">
                <Label className="text-sm font-semibold">
                  Open Graph
                </Label>

                <Input
                  placeholder="OG Title"
                  value={
                    form.seo.og.title
                  }
                  onChange={(e) =>
                    setSeoNested(
                      "og",
                      "title",
                      e.target.value
                    )
                  }
                />

                <Input
                  placeholder="OG Type"
                  value={
                    form.seo.og.type
                  }
                  onChange={(e) =>
                    setSeoNested(
                      "og",
                      "type",
                      e.target.value
                    )
                  }
                />

                <Input
                  placeholder="OG Image"
                  value={
                    form.seo.og.image
                  }
                  onChange={(e) =>
                    setSeoNested(
                      "og",
                      "image",
                      e.target.value
                    )
                  }
                />

                <Input
                  placeholder="OG Image Alt Text"
                  value={
                    form.seo.og.image_alt
                  }
                  onChange={(e) =>
                    setSeoNested(
                      "og",
                      "image_alt",
                      e.target.value
                    )
                  }
                />

                <Input
                  placeholder="OG Locale (e.g. AE-DU)"
                  value={
                    form.seo.og.locale
                  }
                  onChange={(e) =>
                    setSeoNested(
                      "og",
                      "locale",
                      e.target.value
                    )
                  }
                />

                <Input
                  placeholder="OG Site Name"
                  value={
                    form.seo.og.site_name
                  }
                  onChange={(e) =>
                    setSeoNested(
                      "og",
                      "site_name",
                      e.target.value
                    )
                  }
                />

                <Input
                  placeholder="OG URL"
                  value={
                    form.seo.og.url
                  }
                  onChange={(e) =>
                    setSeoNested(
                      "og",
                      "url",
                      e.target.value
                    )
                  }
                />

                <Textarea
                  placeholder="OG Description"
                  value={
                    form.seo.og.description
                  }
                  onChange={(e) =>
                    setSeoNested(
                      "og",
                      "description",
                      e.target.value
                    )
                  }
                />
              </div>

              {/* TWITTER */}

              <div className="border rounded-md p-3 space-y-2">
                <Label className="text-sm font-semibold">
                  Twitter Card
                </Label>

                <Input
                  placeholder="Card Type"
                  value={
                    form.seo.twitter.card
                  }
                  onChange={(e) =>
                    setSeoNested(
                      "twitter",
                      "card",
                      e.target.value
                    )
                  }
                />

                <Input
                  placeholder="Twitter Title"
                  value={
                    form.seo.twitter.title
                  }
                  onChange={(e) =>
                    setSeoNested(
                      "twitter",
                      "title",
                      e.target.value
                    )
                  }
                />

                <Input
                  placeholder="Twitter Site (e.g. Promolecules)"
                  value={
                    form.seo.twitter.site
                  }
                  onChange={(e) =>
                    setSeoNested(
                      "twitter",
                      "site",
                      e.target.value
                    )
                  }
                />

                <Input
                  placeholder="Twitter Image"
                  value={
                    form.seo.twitter.image
                  }
                  onChange={(e) =>
                    setSeoNested(
                      "twitter",
                      "image",
                      e.target.value
                    )
                  }
                />

                <Input
                  placeholder="Twitter Image Alt Text"
                  value={
                    form.seo.twitter.image_alt
                  }
                  onChange={(e) =>
                    setSeoNested(
                      "twitter",
                      "image_alt",
                      e.target.value
                    )
                  }
                />

                <Textarea
                  placeholder="Twitter Description"
                  value={
                    form.seo.twitter.description
                  }
                  onChange={(e) =>
                    setSeoNested(
                      "twitter",
                      "description",
                      e.target.value
                    )
                  }
                />
              </div>

              {/* GEO LOCATION */}

              <div className="border rounded-md p-3 space-y-2">
                <Label className="text-sm font-semibold">
                  Geo Location
                </Label>

                <div
                  className="
                    grid
                    grid-cols-1
                    gap-2
                    sm:grid-cols-2
                  "
                >
                  <Input
                    className="min-w-0"
                    placeholder="Region (e.g. AE-DU)"
                    value={
                      form.seo.geo.region
                    }
                    onChange={(e) =>
                      setSeoNested(
                        "geo",
                        "region",
                        e.target.value
                      )
                    }
                  />

                  <Input
                    className="min-w-0"
                    placeholder="Place Name (e.g. Dubai)"
                    value={
                      form.seo.geo.placename
                    }
                    onChange={(e) =>
                      setSeoNested(
                        "geo",
                        "placename",
                        e.target.value
                      )
                    }
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* VALIDATION ERRORS */}

          {errors.length > 0 && (
            <div
              className="
                border
                border-red-300
                bg-red-50
                text-red-700
                rounded-md
                p-3
                text-sm
                space-y-1
              "
            >
              <p className="font-medium">
                Please fix the following:
              </p>

              <ul className="list-disc pl-5">
                {errors.map((err, i) => (
                  <li key={i}>
                    {err}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* FOOTER */}

          <DialogFooter
            className="
              flex-col-reverse
              gap-2
              sm:flex-row
              sm:justify-end
            "
          >
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                onOpenChange(false)
              }
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>

            <Button
              type="submit"
              className="w-full sm:w-auto"
            >
              {product
                ? "Save Changes"
                : "Add Product"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}