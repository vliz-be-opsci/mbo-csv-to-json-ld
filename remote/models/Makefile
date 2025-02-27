.PHONY: validate diagrams

WORKING_DIR			:= $(shell pwd)
CURRENT_UID			:= $(shell id -u)
CLASSES				:= "Dataset" "PersonOrOrganization" "License" "VariableMeasured" "DataDownload" "DatasetComment"

LINKML					:= linkml
MERMAID_CLI_DOCKER		:= minlag/mermaid-cli:latest
MERMAID_CLI				:= docker run --rm -v "$(WORKING_DIR)":/work -w /work -u root $(MERMAID_CLI_DOCKER)
LINKML_SCHEMA_FILES		:= $(wildcard *.yaml)
MMD_FILES				= $(CLASSES:"%"=diagrams/%.mmd)
SVG_FILES				= $(CLASSES:"%"=diagrams/%.svg)



docker-pull:
	docker pull "$(MERMAID_CLI_DOCKER)"

init: #docker-pull
	@mkdir -p diagrams

validate: $(LINKML_SCHEMA_FILES)
	@$(foreach file,$(LINKML_SCHEMA_FILES), echo "======================> Validating $(file)\n"; \
		$(LINKML) lint --validate "$(file)"; \
		echo "\n"; \
	)

$(MMD_FILES): $(LINKML_SCHEMA_FILES)
	@echo "Generating mermaid for $(@:mermaid-outputs/%=%)"; 
	@$(LINKML) generate erdiagram --format mermaid -c "$(@:diagrams/%.mmd=%)" --max-hops 0 classes.yaml > "$@";

diagrams/%.svg: diagrams/%.mmd
	@echo "Generating SVG for $<"
	@$(MERMAID_CLI) --input "$<" --output "$@";
	@docker run --rm -v "$(WORKING_DIR)":/work -w /work --entrypoint "/bin/sh" -u root $(MERMAID_CLI_DOCKER) -c 'chown -R $(CURRENT_UID):$(CURRENT_UID) "$@"'


diagrams: $(SVG_FILES)
rebuild: clean init diagrams 

clean:
	@rm -rf diagrams

.DEFAULT_GOAL := diagrams