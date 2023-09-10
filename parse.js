import dip from "dumpster-dip";
import * as path from "path";

const input_dir = process.argv[2];
const output_dir = process.argv[3];
const language = process.argv[4];

const opts = {
  input: path.join(
    input_dir,
    `${language}/${language}wiki-latest-pages-articles.xml`,
  ),
  outputDir: path.join(output_dir, language),
  outputMode: "ndjson",
  namespace: 0,
  heartbeat: 5000,
  disambiguation: false,

  parse: function (doc) {
    let page = {
      title: doc.title(),
      pageID: parseInt(doc.pageID()),
      sections: [],
    };
    for (let section of doc.sections()) {
      let section_title = section.title();
      let section_depth = section.depth();

      let current_section = {
        title: section_title,
        depth: section_depth,
        paragraphs: [],
      };

      for (let paragraph of section.paragraphs()) {
        let current_paragraph = [];
        for (let sentence of paragraph.sentences()) {
          let sentence_json = sentence.json();

          let links = [];
          if (sentence_json.links !== undefined) {
            for (let link of sentence_json.links) {
              if (link.type === "internal") {
                links.push({
                  text: link.text,
                  title: link.page,
                });
              }
            }
          }

          current_paragraph.push({
            text: sentence_json.text,
            links: links,
          });
        }

        if (current_paragraph.length > 0) {
          current_section.paragraphs.push(current_paragraph);
        }
      }

      if (current_section.paragraphs.length > 0) {
        page.sections.push(current_section);
      }
    }

    if (page.sections.length == 0) {
      return null;
    }

    return page;
  },
};

dip(opts).then(() => {
  console.log("done");
});
