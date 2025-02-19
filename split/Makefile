.PHONY: split clean output-directories

WORKING_DIR			:= $(shell pwd)
JENA_CLI_DOCKER		:= gsscogs/gss-jvm-build-tools:latest
RIOT				:= docker run --rm -v "$(WORKING_DIR)":/work -w /work $(JENA_CLI_DOCKER) riot
SPARQL				:= docker run --rm -v "$(WORKING_DIR)":/work -w /work $(JENA_CLI_DOCKER) sparql

BULK_TTL_FILES 				:= $(wildcard out/bulk/*.ttl)

output-directories:
	@mkdir -p out/ttl

out/%.json: out/ttl/%.ttl
	@echo "=============================== Converting $< to JSON-LD $@ ===============================" ;
	$(RIOT) --syntax ttl --out json-ld "$<" > "$@";
	@echo "";

define SPLIT_TTL =
$(eval INDIVIDUAL_TTL_FILE_NAMES_$(1) = $(shell $(SPARQL) --data "$(1)" --results tsv 'SELECT DISTINCT ?s WHERE { ?s ?p ?o .}' | tail -n +2 |  cut -c 2- | rev | cut -c 2- | rev | xargs basename -a | sed -e 's/^\(.*\)$$/out\/ttl\/\\\1.ttl/' |  xargs))
$(eval SPLIT_TTL_FILES += $(INDIVIDUAL_TTL_FILE_NAMES_$(1)))

$(INDIVIDUAL_TTL_FILE_NAMES_$(1)) &: $(1)
	@echo "=============================== Splitting $(1) into $(INDIVIDUAL_TTL_FILE_NAMES_$(1)) ==============================="
	@$(foreach output_ttl_file,$(INDIVIDUAL_TTL_FILE_NAMES_$(1)), \
		file_name=$$$$(basename "$(output_ttl_file)"); \
		uri_stub=$$$$(echo "$$$${file_name%.ttl}"); \
		$(SPARQL) --data "$(1)" "prefix schema: <http://schema.org/> prefix goos: <https://goosocean.org/document/> prefix mbo: <https://w3id.org/marco-bolo/> CONSTRUCT {?s ?p ?o.} WHERE {?s ?p ?o. FILTER (STRENDS(STR(?s), \"$$$$uri_stub\")).}" | riot --syntax ttl --formatted ttl --check --strict > "$(output_ttl_file)"; \
		echo "$(output_ttl_file) complete." ;)
	@echo ""
endef

$(foreach file,$(BULK_TTL_FILES),$(eval $(call SPLIT_TTL,$(file))))

SPLIT_JSON_LD_FILES	:= $(SPLIT_TTL_FILES:out/ttl/%.ttl=out/%.json)

ttl: $(SPLIT_TTL_FILES)
jsonld: $(SPLIT_JSON_LD_FILES)

clean:
	@rm -f $(SPLIT_TTL_FILES)
	@rm -f out/ttl

.DEFAULT_GOAL := jsonld