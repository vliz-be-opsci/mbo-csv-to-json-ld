.PHONY: docker-pull output-directories split clean bulk-ttl bulk-jsonld all init

WORKING_DIR			:= $(shell pwd)
CSVW_CHECK_DOCKER	:= gsscogs/csvw-check:latest
CSV2RDF_DOCKER		:= europe-west2-docker.pkg.dev/swirrl-devops-infrastructure-1/public/csv2rdf:v0.7.1
JENA_CLI_DOCKER		:= gsscogs/gss-jvm-build-tools:latest

CSVW_CHECK			:= docker run --rm -v "$(WORKING_DIR)":/work -w /work $(CSVW_CHECK_DOCKER) /opt/docker/bin/csvw-check -s
CSV2RDF				:= docker run --rm -v "$(WORKING_DIR)":/work -w /work $(CSV2RDF_DOCKER) csv2rdf -m minimal -u 
RIOT				:= docker run --rm -v "$(WORKING_DIR)":/work -w /work $(JENA_CLI_DOCKER) riot
SPARQL				:= docker run --rm -v "$(WORKING_DIR)":/work -w /work $(JENA_CLI_DOCKER) sparql

CSVW_METADATA_FILES 		:= $(wildcard remote/*-metadata.json)
BULK_TTL_FILES    			:= $(CSVW_METADATA_FILES:remote/%-metadata.json=out/bulk/%.ttl)
BULK_JSON_LD_FILES 			:= $(CSVW_METADATA_FILES:remote/%-metadata.json=out/bulk/%.json)

docker-pull:
	@echo "=============================== Pulling latest required docker images. ==============================="
	@docker pull $(CSVW_CHECK_DOCKER)
	@docker pull $(CSV2RDF_DOCKER)
	@docker pull $(JENA_CLI_DOCKER)
	@echo "" ; 

output-directories:
	@mkdir -p out/bulk

validate: $(CSVW_METADATA_FILES)
	@for file in $(CSVW_METADATA_FILES) ; do \
		echo "=============================== Validating $$file ===============================" ; \
		$(CSVW_CHECK) "$$file" ; \
		echo "" ; \
	done

out/bulk/%.json: out/bulk/%.ttl
	@echo "=============================== Converting $< to JSON-LD $@ ===============================" ;
	@$(RIOT) --syntax ttl --out json-ld "$<" > "$@";
	@echo "";

bulk-ttl: $(BULK_TTL_FILES)

bulk-jsonld: $(BULK_JSON_LD_FILES)

split: $(BULK_TTL_FILES)
	@$(MAKE) -f split/Makefile jsonld

init:
	@$(MAKE) output-directories docker-pull 
	@$(MAKE) -f split/Makefile init

all:
	@$(MAKE) init validate bulk-jsonld split

clean:
	@$(MAKE) -f split/Makefile clean
	@rm -rf out


.DEFAULT_GOAL := all

define CSVW_TO_TTL =
# Defines the target to convert a CSV-W into TTL
#  Importantly it makes sure that its local CSV files are listed as dependencies for make.
$(eval CSVW_FILE_NAME := $(shell basename "$(1)"))
$(eval TTL_FILE_$(1) := $(CSVW_FILE_NAME:%-metadata.json=out/bulk/%.ttl))
$(eval CSVW_DIR_NAME_$(1) := $(shell dirname $$(realpath $(1))))

# todo: At some point the below SPARQL query needs to filter out CSV paths which are genuine URLs (e.g. start with http:// or https://)
$(eval INDIVIDUAL_CSV_DEPENDENCIES_COMMAND_$(1) := $(RIOT) --syntax jsonld --formatted ttl "$(1)" > "$(1).tmp.ttl"; \
		$(SPARQL) --data "$(1).tmp.ttl" --results tsv "SELECT (str(?url) as ?csv) WHERE { [] <http://www.w3.org/ns/csvw\#url> ?url.}" \
			| tail -n +2 \
			| sed 's/"\(.*\)"/\1/g' \
			| awk '{print "$(CSVW_DIR_NAME_$(1))/" $$$$0}' \
			| xargs -l realpath --relative-to "$(WORKING_DIR)" \
			| xargs;)
$(eval INDIVIDUAL_CSV_DEPENDENCIES_$(1) = $(shell $(INDIVIDUAL_CSV_DEPENDENCIES_COMMAND_$(1)) ))
$(eval $(shell rm -rf "$(1).tmp.ttl"))

$(TTL_FILE_$(1)): $(1) $(INDIVIDUAL_CSV_DEPENDENCIES_$(1))
	@echo "=============================== Converting $$< to ttl $$@ ===============================" ;
	@$$(CSV2RDF) "$$<" -o "$$@";
	@echo "" ;
endef

$(foreach file,$(CSVW_METADATA_FILES),$(eval $(call CSVW_TO_TTL,$(file))))
