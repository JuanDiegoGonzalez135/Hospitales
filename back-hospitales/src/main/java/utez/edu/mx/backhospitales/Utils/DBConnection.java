package utez.edu.mx.backhospitales.Utils;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.datasource.DriverManagerDataSource;

import javax.sql.DataSource;

@Configuration

public class DBConnection {
    @Value("${db.name}")
    public String name;

    @Value("${db.host}")
    public String host;

    @Value("${db.port}")
    public String port;

    @Value("${db.pass}")
    public String pass;

    @Value("${db.user}")
    public String user;


    @Bean
    public DataSource getDBConneccion(){
        DriverManagerDataSource source = new DriverManagerDataSource();
        source.setDriverClassName("com.mysql.cj.jdbc.Driver");
        //jdbc:mysql://localhost:3306/adj-demo
        source.setUrl("jdbc:mysql://" + host + ":" + port + "/" + name);
        source.setPassword(pass);
        source.setUsername(user);

        return source;
    }
}
