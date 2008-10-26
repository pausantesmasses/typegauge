require 'sha1'

app_name = 'typegauge'
version = '0.3'
uri = 'http://pau.santesmasses.net/typegauge/releases/'

system("svn --force export ../src ../build && cd ../build && zip -rm #{app_name}.#{version}.xpi . && cd ..")

hash = Digest::SHA1.hexdigest(File.read("../build/#{app_name}.#{version}.xpi"))

update_rdf = <<XML
<?xml version="1.0"?>
<r:RDF xmlns:r="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
       xmlns="http://www.mozilla.org/2004/em-rdf#">
<!-- #{app_name} Extension -->
<r:Description about="urn:mozilla:extension:{9bee8907-d91c-49b4-b947-cdb9c6716c1c}">
  <updates>
    <r:Seq>
      <r:li>
        <r:Description>
          <version>#{version}</version>
          <targetApplication>
            <r:Description>
              <id>{ec8030f7-c20a-464f-9b0e-13a3a9e97384}</id>
              <minVersion>1.5</minVersion>
              <maxVersion>3</maxVersion>
              <updateLink>#{uri}#{app_name}.#{version}.xpi</updateLink>
              <updateHash>sha1:#{hash}</updateHash>
            </r:Description>
          </targetApplication>
        </r:Description>
      </r:li>
    </r:Seq>
  </updates>
  <version>#{version}</version>
  <updateLink>#{uri}#{app_name}.#{version}.xpi</updateLink>
</r:Description>
</r:RDF>
XML

File.open('../build/update.rdf', 'w') do |f|
  f.write update_rdf
end

p "Don't forget to sign the update.rdf!!!"
